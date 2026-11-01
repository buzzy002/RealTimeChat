from django.test import TestCase


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