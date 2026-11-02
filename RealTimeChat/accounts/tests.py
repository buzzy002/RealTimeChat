from django.test import TestCase
from .models import Channel, User, Workspace, WorkspaceMembership


class AuthApiTests(TestCase):
    def test_register_then_me(self):
        response = self.client.post(
            "/api/auth/register/",
            {"username": "alice", "email": "alice@example.com",
             "password1": "Un-mot-de-passe-solide-42",
             "password2": "Un-mot-de-passe-solide-42"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(self.client.get("/api/auth/me/").json()["authenticated"])

    def test_login_with_wrong_password(self):
        response = self.client.post(
            "/api/auth/login/",
            {"username": "personne", "password": "faux"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_register_joins_default_workspace(self):
        self.client.post(
            "/api/auth/register/",
            {"username": "bob", "email": "bob@example.com",
             "password1": "A-strong-password-42",
             "password2": "A-strong-password-42"},
            content_type="application/json",
        )
        from .models import WorkspaceMembership
        self.assertTrue(
            WorkspaceMembership.objects.filter(
                user__username="bob", workspace__name="Demo"
            ).exists()
        )

class ChannelsApiTests(TestCase):
    def test_anonymous_gets_401(self):
        self.assertEqual(self.client.get("/api/channels/").status_code, 401)

    def test_member_sees_only_their_channels(self):
        mine = Workspace.objects.create(name="Mine")
        other = Workspace.objects.create(name="Other")
        Channel.objects.create(name="general", workspace=mine)
        Channel.objects.create(name="secret", workspace=other)
        user = User.objects.create_user("alice", password="x")
        WorkspaceMembership.objects.create(user=user, workspace=mine)
        self.client.force_login(user)
        names = [c["name"] for c in self.client.get("/api/channels/").json()["channels"]]
        self.assertEqual(names, ["general"])


class CreateChannelApiTests(TestCase):
    def setUp(self):
        self.workspace = Workspace.objects.create(name="Team")
        self.user = User.objects.create_user("alice", password="x")
        WorkspaceMembership.objects.create(user=self.user, workspace=self.workspace)
        self.client.force_login(self.user)

    def create(self, name, workspace_id=None):
        return self.client.post(
            "/api/channels/",
            {"name": name, "workspace_id": workspace_id or self.workspace.id},
            content_type="application/json",
        )

    def test_member_creates_a_normalized_channel(self):
        response = self.create("My Channel !")
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["channel"]["name"], "my-channel")

    def test_duplicate_name_is_rejected(self):
        self.create("general")
        self.assertEqual(self.create("General").status_code, 400)

    def test_cannot_create_in_another_workspace(self):
        other = Workspace.objects.create(name="Other")
        self.assertEqual(self.create("secret", other.id).status_code, 403)