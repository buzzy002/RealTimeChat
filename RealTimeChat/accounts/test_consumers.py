from channels.db import database_sync_to_async
from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator
from django.contrib.auth.models import AnonymousUser
from django.test import TransactionTestCase, Client

from .models import Channel, User, Workspace, WorkspaceMembership
from .routing import websocket_urlpatterns

application = URLRouter(websocket_urlpatterns)


class ChannelConsumerTests(TransactionTestCase):
    def setUp(self):
        workspace = Workspace.objects.create(name="Test")
        self.channel = Channel.objects.create(name="general", workspace=workspace)
        self.alice = User.objects.create_user("alice", password="x")
        self.bob = User.objects.create_user("bob", password="x")
        self.eve = User.objects.create_user("eve", password="x")  # not a member
        for user in (self.alice, self.bob):
            WorkspaceMembership.objects.create(user=user, workspace=workspace)

    def communicator(self, user):
        communicator = WebsocketCommunicator(application, f"/ws/channels/{self.channel.id}/")
        communicator.scope["user"] = user
        return communicator

    async def test_anonymous_is_refused(self):
        connected, _ = await self.communicator(AnonymousUser()).connect()
        self.assertFalse(connected)

    async def test_non_member_is_refused(self):
        connected, _ = await self.communicator(self.eve).connect()
        self.assertFalse(connected)

    async def test_message_is_broadcast_to_members(self):
        alice, bob = self.communicator(self.alice), self.communicator(self.bob)
        for communicator in (alice, bob):
            connected, _ = await communicator.connect()
            self.assertTrue(connected)
            history = await communicator.receive_json_from()
            self.assertEqual(history["type"], "history")

        await alice.send_json_to({"content": "Hello"})

        for communicator in (alice, bob):
            event = await communicator.receive_json_from()
            self.assertEqual(event["type"], "message")
            self.assertEqual(event["message"]["text"], "Hello")
            self.assertEqual(event["message"]["sender"], "alice")

        await alice.disconnect()
        await bob.disconnect()

class PrivateConversationTests(TransactionTestCase):
    def setUp(self):
        workspace = Workspace.objects.create(name="Team")
        self.alice = User.objects.create_user("alice", password="x")
        self.bob = User.objects.create_user("bob", password="x")
        self.carol = User.objects.create_user("carol", password="x")  # same team, not in the DM
        for user in (self.alice, self.bob, self.carol):
            WorkspaceMembership.objects.create(user=user, workspace=workspace)
        self.general = Channel.objects.create(name="general", workspace=workspace)
        self.dm = Channel.objects.create(name="dm-test", workspace=workspace, is_direct=True)
        self.dm.members.add(self.alice, self.bob)

    def socket(self, path, user):
        communicator = WebsocketCommunicator(application, path)
        communicator.scope["user"] = user
        return communicator

    async def test_only_participants_join_a_direct_conversation(self):
        connected, _ = await self.socket(f"/ws/channels/{self.dm.id}/", self.carol).connect()
        self.assertFalse(connected)

        bob = self.socket(f"/ws/channels/{self.dm.id}/", self.bob)
        connected, _ = await bob.connect()
        self.assertTrue(connected)
        await bob.disconnect()

    async def test_members_are_notified_of_new_messages(self):
        notifications = self.socket("/ws/notifications/", self.bob)
        connected, _ = await notifications.connect()
        self.assertTrue(connected)

        alice = self.socket(f"/ws/channels/{self.general.id}/", self.alice)
        await alice.connect()
        await alice.receive_json_from()  # history
        await alice.send_json_to({"content": "Ping"})

        event = await notifications.receive_json_from()
        self.assertEqual(event["type"], "notify")
        self.assertEqual(event["channel_id"], self.general.id)
        self.assertEqual(event["message"]["text"], "Ping")

        await alice.disconnect()
        await notifications.disconnect()

    async def test_new_channel_refreshes_other_sidebars(self):
        notifications = self.socket("/ws/notifications/", self.bob)
        connected, _ = await notifications.connect()
        self.assertTrue(connected)

        await database_sync_to_async(self.create_channel_as_alice)()

        event = await notifications.receive_json_from()
        self.assertEqual(event["type"], "sidebar")
        await notifications.disconnect()

    def create_channel_as_alice(self):
        client = Client()
        client.force_login(self.alice)
        response = client.post(
            "/api/channels/",
            {"name": "design", "workspace_id": self.general.workspace_id},
            content_type="application/json",
        )
        assert response.status_code == 201