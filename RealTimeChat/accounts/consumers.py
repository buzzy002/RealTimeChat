from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from .models import Channel, Message, WorkspaceMembership


def serialize(m):
    return {
        "id": m.id,
        "sender": m.sender.username,
        "text": m.content,
        "time": m.timestamp.isoformat(),
    }


class ChannelConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        self.channel_id = self.scope["url_route"]["kwargs"]["channel_id"]
        if not user.is_authenticated or not await self.can_access(user):
            await self.close()
            return
        self.group = f"channel_{self.channel_id}"
        await self.channel_layer.group_add(self.group, self.channel_name)
        await self.accept()
        await self.send_json({"type": "history", "messages": await self.history()})

    async def disconnect(self, code):
        if hasattr(self, "group"):
            await self.channel_layer.group_discard(self.group, self.channel_name)

    async def receive_json(self, content):
        if not isinstance(content, dict):
            return
        text = str(content.get("content") or "").strip()
        if not text or len(text) > 4000:
            return
        message = await self.save(text)
        await self.channel_layer.group_send(
            self.group, {"type": "chat.message", "message": message}
        )
        for user_id in await self.recipients():
            await self.channel_layer.group_send(
                f"user_{user_id}",
                {"type": "notify", "channel_id": self.channel_id, "message": message},
            )

    async def chat_message(self, event):
        await self.send_json({"type": "message", "message": event["message"]})

    @database_sync_to_async
    def can_access(self, user):
        return Channel.objects.visible_to(user).filter(id=self.channel_id).exists()

    @database_sync_to_async
    def history(self):
        latest = list(
            Message.objects.filter(channel_id=self.channel_id, parent=None)
            .select_related("sender")
            .order_by("-timestamp")[:50]
        )
        return [serialize(m) for m in reversed(latest)]

    @database_sync_to_async
    def save(self, text):
        m = Message.objects.create(
            channel_id=self.channel_id, sender=self.scope["user"], content=text
        )
        return serialize(m)

    @database_sync_to_async
    def recipients(self):
        """Everyone who can read this channel, except the sender."""
        channel = Channel.objects.get(id=self.channel_id)
        if channel.is_direct:
            ids = channel.members.values_list("id", flat=True)
        else:
            ids = WorkspaceMembership.objects.filter(
                workspace_id=channel.workspace_id
            ).values_list("user_id", flat=True)
        return [i for i in ids if i != self.scope["user"].id]

class NotificationConsumer(AsyncJsonWebsocketConsumer):
    """One socket per browser tab, joined to the user's personal group."""

    async def connect(self):
        user = self.scope["user"]
        if not user.is_authenticated:
            await self.close()
            return
        self.group = f"user_{user.id}"
        await self.channel_layer.group_add(self.group, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        if hasattr(self, "group"):
            await self.channel_layer.group_discard(self.group, self.channel_name)

    async def notify(self, event):
        await self.send_json(
            {"type": "notify", "channel_id": event["channel_id"], "message": event["message"]}
        )