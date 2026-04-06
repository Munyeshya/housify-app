from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import AgentProfile, AgentType, LandlordProfile, TenantProfile, User, UserRole
from agents.models import AgentAssignmentStatus, PropertyAgentAssignment
from properties.models import BillingCycle, Property, PropertyStatus, PropertyType
from tenancies.models import Tenancy, TenancyStatus

from .models import LandlordDocumentVerificationAccess, LegalDocumentStatus, TenantLegalDocument


class DocumentsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.landlord_user = User.objects.create_user(
            email="landlord@example.com",
            password="password123",
            role=UserRole.LANDLORD,
            full_name="Landlord One",
        )
        self.landlord = LandlordProfile.objects.create(user=self.landlord_user, display_name="Landlord One")

        self.tenant_user = User.objects.create_user(
            email="tenant@example.com",
            password="password123",
            role=UserRole.TENANT,
            full_name="Tenant One",
        )
        self.tenant = TenantProfile.objects.create(user=self.tenant_user)

        self.admin_user = User.objects.create_superuser(
            email="admin@example.com",
            password="password123",
            full_name="Platform Admin",
        )

        self.public_agent_user = User.objects.create_user(
            email="public-agent@example.com",
            password="password123",
            role=UserRole.AGENT,
            full_name="Public Agent",
        )
        self.public_agent = AgentProfile.objects.create(
            user=self.public_agent_user,
            agent_type=AgentType.PUBLIC,
        )

        self.private_agent_user = User.objects.create_user(
            email="private-agent@example.com",
            password="password123",
            role=UserRole.AGENT,
            full_name="Private Agent",
        )
        self.private_agent = AgentProfile.objects.create(
            user=self.private_agent_user,
            agent_type=AgentType.PRIVATE,
            created_by_landlord=self.landlord,
        )

        self.property = Property.objects.create(
            landlord=self.landlord,
            name="green-heights",
            title="Green Heights Apartments",
            short_description="Managed property",
            description="A managed property for document access tests.",
            property_type=PropertyType.APARTMENT,
            status=PropertyStatus.AVAILABLE,
            is_public=True,
            address_line_1="KG 10 Ave",
            city="Kigali",
            rent_amount=300000,
            currency="RWF",
            billing_cycle=BillingCycle.MONTHLY,
        )

    def test_tenant_can_create_or_update_legal_document(self):
        self.client.force_authenticate(user=self.tenant.user)
        response = self.client.post(
            "/api/v1/documents/legal-id/",
            {
                "tenant": self.tenant.id,
                "document_type": "National ID",
                "document_number": "1199980012345678",
                "document_url": "https://example.com/legal-id.pdf",
                "issuing_country": "Rwanda",
                "status": LegalDocumentStatus.SUBMITTED,
            },
            format="json",
        )

        self.tenant.refresh_from_db()
        self.assertEqual(response.status_code, 201)
        self.assertEqual(TenantLegalDocument.objects.count(), 1)
        self.assertEqual(self.tenant.legal_id_document_url, "https://example.com/legal-id.pdf")

    def test_landlord_can_view_document_for_current_occupant(self):
        TenantLegalDocument.objects.create(
            tenant=self.tenant,
            document_type="National ID",
            document_number="1199980012345678",
            document_url="https://example.com/legal-id.pdf",
        )
        Tenancy.objects.create(
            landlord=self.landlord,
            property=self.property,
            tenant=self.tenant,
            assigned_by=self.landlord_user,
            status=TenancyStatus.ACTIVE,
            start_date="2026-04-01",
            monthly_rent_snapshot=300000,
            security_deposit_snapshot=300000,
            billing_cycle_snapshot=BillingCycle.MONTHLY,
        )

        self.client.force_authenticate(user=self.landlord.user)
        response = self.client.get(
            f"/api/v1/documents/legal-id/access/?tenant={self.tenant.id}"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["document_number"], "1199980012345678")

    def test_landlord_cannot_view_document_without_active_tenancy(self):
        TenantLegalDocument.objects.create(
            tenant=self.tenant,
            document_type="National ID",
            document_number="1199980012345678",
            document_url="https://example.com/legal-id.pdf",
        )

        self.client.force_authenticate(user=self.landlord.user)
        response = self.client.get(
            f"/api/v1/documents/legal-id/access/?tenant={self.tenant.id}"
        )

        self.assertEqual(response.status_code, 400)

    def test_private_agent_can_view_document_for_managed_current_occupant(self):
        TenantLegalDocument.objects.create(
            tenant=self.tenant,
            document_type="National ID",
            document_number="1199980012345678",
            document_url="https://example.com/legal-id.pdf",
        )
        Tenancy.objects.create(
            landlord=self.landlord,
            property=self.property,
            tenant=self.tenant,
            assigned_by=self.landlord_user,
            status=TenancyStatus.ACTIVE,
            start_date="2026-04-01",
            monthly_rent_snapshot=300000,
            security_deposit_snapshot=300000,
            billing_cycle_snapshot=BillingCycle.MONTHLY,
        )
        PropertyAgentAssignment.objects.create(
            landlord=self.landlord,
            agent=self.private_agent,
            property=self.property,
            status=AgentAssignmentStatus.ACTIVE,
            granted_by=self.landlord_user,
        )

        self.client.force_authenticate(user=self.private_agent.user)
        response = self.client.get(
            f"/api/v1/documents/legal-id/access/?tenant={self.tenant.id}"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["document_type"], "National ID")

    def test_public_agent_cannot_view_document(self):
        TenantLegalDocument.objects.create(
            tenant=self.tenant,
            document_type="National ID",
            document_number="1199980012345678",
            document_url="https://example.com/legal-id.pdf",
        )
        Tenancy.objects.create(
            landlord=self.landlord,
            property=self.property,
            tenant=self.tenant,
            assigned_by=self.landlord_user,
            status=TenancyStatus.ACTIVE,
            start_date="2026-04-01",
            monthly_rent_snapshot=300000,
            security_deposit_snapshot=300000,
            billing_cycle_snapshot=BillingCycle.MONTHLY,
        )
        PropertyAgentAssignment.objects.create(
            landlord=self.landlord,
            agent=self.public_agent,
            property=self.property,
            status=AgentAssignmentStatus.ACTIVE,
            granted_by=self.landlord_user,
        )

        self.client.force_authenticate(user=self.public_agent.user)
        response = self.client.get(
            f"/api/v1/documents/legal-id/access/?tenant={self.tenant.id}"
        )

        self.assertEqual(response.status_code, 400)

    def test_platform_admin_can_view_any_document(self):
        TenantLegalDocument.objects.create(
            tenant=self.tenant,
            document_type="National ID",
            document_number="1199980012345678",
            document_url="https://example.com/legal-id.pdf",
        )

        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(
            f"/api/v1/documents/legal-id/access/?tenant={self.tenant.id}"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["tenant"], self.tenant.id)

    def test_platform_admin_can_grant_landlord_document_verification_access(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(
            "/api/v1/documents/legal-id/verification-access/",
            {
                "landlord": self.landlord.id,
                "is_enabled": True,
                "provider_code": "national-registry",
                "notes": "Paid verification access enabled.",
            },
            format="json",
        )

        access = LandlordDocumentVerificationAccess.objects.get(landlord=self.landlord)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(access.is_enabled)
        self.assertEqual(access.granted_by, self.admin_user)

    def test_landlord_document_verification_status_returns_grant(self):
        LandlordDocumentVerificationAccess.objects.create(
            landlord=self.landlord,
            is_enabled=True,
            granted_by=self.admin_user,
            provider_code="national-registry",
        )

        self.client.force_authenticate(user=self.landlord_user)
        response = self.client.get("/api/v1/documents/legal-id/verification-access/me/")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.data["is_enabled"])

    def test_landlord_document_verification_uses_unconfigured_gateway_socket(self):
        TenantLegalDocument.objects.create(
            tenant=self.tenant,
            document_type="National ID",
            document_number="1199980012345678",
            document_url="https://example.com/legal-id.pdf",
        )
        LandlordDocumentVerificationAccess.objects.create(
            landlord=self.landlord,
            is_enabled=True,
            granted_by=self.admin_user,
            provider_code="national-registry",
        )

        self.client.force_authenticate(user=self.landlord_user)
        response = self.client.post(
            "/api/v1/documents/legal-id/verify/",
            {"tenant": self.tenant.id},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.data["is_available"])
        self.assertIsNone(response.data["is_valid"])

    def test_deleting_document_clears_legacy_tenant_profile_fields(self):
        document = TenantLegalDocument.objects.create(
            tenant=self.tenant,
            document_type="National ID",
            document_number="1199980012345678",
            document_url="https://example.com/legal-id.pdf",
        )

        self.client.force_authenticate(user=self.tenant.user)
        response = self.client.delete(f"/api/v1/documents/legal-id/{document.id}/")

        self.tenant.refresh_from_db()
        self.assertEqual(response.status_code, 204)
        self.assertEqual(self.tenant.legal_id_type, "")
        self.assertEqual(self.tenant.legal_id_number, "")
        self.assertEqual(self.tenant.legal_id_document_url, "")

    def test_tenant_registration_with_legal_id_creates_document_record(self):
        response = self.client.post(
            "/api/v1/accounts/register/tenant/",
            {
                "email": "new-tenant@example.com",
                "full_name": "New Tenant",
                "phone_number": "0788000000",
                "password": "password123",
                "legal_id_type": "Passport",
                "legal_id_number": "PA12345",
                "legal_id_document_url": "https://example.com/passport.pdf",
            },
            format="json",
        )

        tenant = TenantProfile.objects.get(user__email="new-tenant@example.com")
        document = TenantLegalDocument.objects.get(tenant=tenant)

        self.assertEqual(response.status_code, 201)
        self.assertEqual(document.document_type, "Passport")
        self.assertEqual(document.document_url, "https://example.com/passport.pdf")
