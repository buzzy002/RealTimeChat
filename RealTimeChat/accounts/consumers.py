from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncJsonWebsocketConsumer

from .models import Channel, Message


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

    async def chat_message(self, event):
        await self.send_json({"type": "message", "message": event["message"]})

    @database_sync_to_async
    def can_access(self, user):
        return Channel.objects.filter(
            id=self.channel_id, workspace__memberships__user=user
        ).exists()

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