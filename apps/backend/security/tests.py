from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User, UserRole

from .models import SecurityEvent, SecurityEventType, SecurityFlag, SecurityFlagSeverity, SecurityFlagStatus


class SecurityOperationsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser(
            email="admin@example.com",
            password="password123",
            full_name="Platform Admin",
        )
        self.landlord_user = User.objects.create_user(
            email="landlord@example.com",
            password="password123",
            role=UserRole.LANDLORD,
            full_name="Landlord One",
        )
        SecurityEvent.objects.create(
            actor=self.admin_user,
            event_type=SecurityEventType.LOGIN_SUCCESS,
            success=True,
            target_type="user",
            target_id=str(self.admin_user.id),
            metadata={"seeded": True},
        )

    def test_admin_can_list_security_events(self):
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.get("/api/v1/security/events/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["event_type"], SecurityEventType.LOGIN_SUCCESS)

    def test_admin_can_suspend_and_reactivate_user(self):
        self.client.force_authenticate(user=self.admin_user)

        suspend_response = self.client.post(
            f"/api/v1/security/users/{self.landlord_user.id}/suspend/",
            {"reason": "Suspicious activity under review."},
            format="json",
        )
        self.landlord_user.refresh_from_db()

        reactivate_response = self.client.post(
            f"/api/v1/security/users/{self.landlord_user.id}/reactivate/",
            {"reason": "Cleared after review."},
            format="json",
        )
        self.landlord_user.refresh_from_db()

        self.assertEqual(suspend_response.status_code, 200)
        self.assertEqual(reactivate_response.status_code, 200)
        self.assertTrue(self.landlord_user.is_active)
        self.assertTrue(
            SecurityEvent.objects.filter(event_type=SecurityEventType.USER_SUSPENDED).exists()
        )
        self.assertTrue(
            SecurityEvent.objects.filter(event_type=SecurityEventType.USER_REACTIVATED).exists()
        )

    def test_admin_can_create_and_resolve_security_flag(self):
        self.client.force_authenticate(user=self.admin_user)

        create_response = self.client.post(
            "/api/v1/security/flags/",
            {
                "target_type": "payment",
                "target_id": "42",
                "severity": SecurityFlagSeverity.HIGH,
                "reason": "Potential duplicate rent payment.",
            },
            format="json",
        )
        flag = SecurityFlag.objects.get()

        resolve_response = self.client.post(
            f"/api/v1/security/flags/{flag.id}/decision/",
            {
                "status": SecurityFlagStatus.RESOLVED,
                "resolution_notes": "Reviewed and handled.",
            },
            format="json",
        )
        flag.refresh_from_db()

        self.assertEqual(create_response.status_code, 201)
        self.assertEqual(resolve_response.status_code, 200)
        self.assertEqual(flag.status, SecurityFlagStatus.RESOLVED)
        self.assertEqual(flag.resolved_by, self.admin_user)
        self.assertTrue(
            SecurityEvent.objects.filter(event_type=SecurityEventType.SECURITY_FLAG_CREATED).exists()
        )
        self.assertTrue(
            SecurityEvent.objects.filter(event_type=SecurityEventType.SECURITY_FLAG_RESOLVED).exists()
        )
