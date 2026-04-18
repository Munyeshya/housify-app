from django.test import TestCase
from rest_framework.authtoken.models import Token
from rest_framework.test import APIClient

from .models import (
    AgentProfile,
    AgentType,
    LandlordProfile,
    TENANT_IDENTIFIER_ALPHABET,
    TenantProfile,
    User,
    UserRole,
)


class AccountsAuthApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email="landlord@example.com",
            password="password123",
            role=UserRole.LANDLORD,
            full_name="Landlord One",
        )
        self.landlord_profile = LandlordProfile.objects.create(user=self.user, display_name="Landlord One")
        self.tenant_user = User.objects.create_user(
            email="tenant@example.com",
            password="password123",
            role=UserRole.TENANT,
            full_name="Tenant One",
        )
        self.tenant_profile = TenantProfile.objects.create(user=self.tenant_user)
        self.agent_user = User.objects.create_user(
            email="agent@example.com",
            password="password123",
            role=UserRole.AGENT,
            full_name="Agent One",
        )
        self.agent_profile = AgentProfile.objects.create(
            user=self.agent_user,
            agent_type=AgentType.PUBLIC,
            bio="Helping with listings",
        )

    def test_login_returns_token_and_user(self):
        response = self.client.post(
            "/api/v1/accounts/login/",
            {
                "email": "landlord@example.com",
                "password": "password123",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("token", response.data)
        self.assertEqual(response.data["user"]["email"], self.user.email)

    def test_me_requires_authenticated_user(self):
        response = self.client.get("/api/v1/accounts/me/")

        self.assertEqual(response.status_code, 401)

    def test_me_returns_authenticated_user_profile(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/v1/accounts/me/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["email"], self.user.email)

    def test_logout_deletes_current_user_token(self):
        token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {token.key}")

        response = self.client.post("/api/v1/accounts/logout/")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(Token.objects.filter(user=self.user).exists())

    def test_landlord_profile_returns_authenticated_profile(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/v1/accounts/profile/landlord/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["display_name"], self.landlord_profile.display_name)

    def test_landlord_profile_can_be_updated(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            "/api/v1/accounts/profile/landlord/",
            {
                "display_name": "Updated Landlord",
                "phone_number": "0788000000",
            },
            format="json",
        )

        self.landlord_profile.refresh_from_db()
        self.user.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.landlord_profile.display_name, "Updated Landlord")
        self.assertEqual(self.user.phone_number, "0788000000")

    def test_tenant_profile_returns_authenticated_profile(self):
        self.client.force_authenticate(user=self.tenant_user)

        response = self.client.get("/api/v1/accounts/profile/tenant/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["tenant_identifier"], str(self.tenant_profile.tenant_identifier))

    def test_tenant_identifier_is_short_and_memorable(self):
        identifier = self.tenant_profile.tenant_identifier

        self.assertRegex(identifier, r"^TNT-[A-Z2-9]{6}$")
        self.assertTrue(all(character in f"{TENANT_IDENTIFIER_ALPHABET}-" for character in identifier[4:]))

    def test_agent_profile_can_be_updated(self):
        self.client.force_authenticate(user=self.agent_user)

        response = self.client.patch(
            "/api/v1/accounts/profile/agent/",
            {
                "bio": "Updated bio",
                "full_name": "Agent Updated",
            },
            format="json",
        )

        self.agent_profile.refresh_from_db()
        self.agent_user.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.agent_profile.bio, "Updated bio")
        self.assertEqual(self.agent_user.full_name, "Agent Updated")
