from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import AgentProfile, AgentType, LandlordProfile, TenantProfile, User, UserRole
from agents.models import AgentAssignmentStatus, PropertyAgentAssignment
from bookmarks.models import PropertyBookmark
from complaints.models import Complaint, ComplaintCategory, ComplaintDirection, ComplaintStatus
from documents.models import LandlordDocumentVerificationAccess, TenantLegalDocument
from payments.models import Payment, PaymentCategory, PaymentMethod, PaymentStatus
from properties.models import BillingCycle, Property, PropertyStatus, PropertyType
from tenancies.models import Tenancy, TenancyStatus


class DashboardApiTests(TestCase):
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
        TenantLegalDocument.objects.create(
            tenant=self.tenant,
            document_type="National ID",
            document_number="1199980012345678",
            document_url="https://example.com/legal-id.pdf",
        )

        self.agent_user = User.objects.create_user(
            email="agent@example.com",
            password="password123",
            role=UserRole.AGENT,
            full_name="Private Agent",
        )
        self.agent = AgentProfile.objects.create(
            user=self.agent_user,
            agent_type=AgentType.PRIVATE,
            created_by_landlord=self.landlord,
        )
        self.admin_user = User.objects.create_superuser(
            email="admin@example.com",
            password="password123",
            full_name="Platform Admin",
        )

        self.property = Property.objects.create(
            landlord=self.landlord,
            name="green-heights",
            title="Green Heights Apartments",
            short_description="Managed listing",
            description="A managed property.",
            property_type=PropertyType.APARTMENT,
            status=PropertyStatus.AVAILABLE,
            is_public=True,
            address_line_1="KG 10 Ave",
            city="Kigali",
            latitude=-1.944072,
            longitude=30.061885,
            rent_amount=300000,
            currency="RWF",
            billing_cycle=BillingCycle.MONTHLY,
        )
        self.tenancy = Tenancy.objects.create(
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
        Payment.objects.create(
            tenancy=self.tenancy,
            category=PaymentCategory.RENT,
            status=PaymentStatus.PAID,
            method=PaymentMethod.MOBILE_MONEY,
            amount_due=300000,
            amount_paid=300000,
            currency="RWF",
            reference="PAY-001",
        )
        Complaint.objects.create(
            tenancy=self.tenancy,
            created_by=self.tenant_user,
            assigned_to=self.landlord_user,
            title="Water leak",
            description="Kitchen sink leaking",
            category=ComplaintCategory.MAINTENANCE,
            direction=ComplaintDirection.TENANT_TO_LANDLORD,
            status=ComplaintStatus.OPEN,
        )
        PropertyBookmark.objects.create(tenant=self.tenant, property=self.property)
        PropertyAgentAssignment.objects.create(
            landlord=self.landlord,
            agent=self.agent,
            property=self.property,
            status=AgentAssignmentStatus.ACTIVE,
            granted_by=self.landlord_user,
        )
        LandlordDocumentVerificationAccess.objects.create(
            landlord=self.landlord,
            is_enabled=True,
            granted_by=self.admin_user,
        )

    def test_landlord_dashboard_returns_summary(self):
        self.client.force_authenticate(user=self.landlord_user)

        response = self.client.get("/api/v1/dashboards/landlord/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["landlord"], self.landlord.id)
        self.assertEqual(response.data["public_listing_count"], 1)
        self.assertEqual(response.data["active_agent_count"], 1)

    def test_tenant_dashboard_returns_summary(self):
        self.client.force_authenticate(user=self.tenant_user)

        response = self.client.get("/api/v1/dashboards/tenant/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["tenant"], self.tenant.id)
        self.assertEqual(response.data["saved_property_count"], 1)
        self.assertTrue(response.data["has_legal_document"])

    def test_agent_dashboard_returns_summary(self):
        self.client.force_authenticate(user=self.agent_user)

        response = self.client.get("/api/v1/dashboards/agent/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["agent"], self.agent.id)
        self.assertEqual(response.data["managed_property_count"], 1)
        self.assertTrue(response.data["can_view_legal_id"])

    def test_admin_dashboard_returns_platform_summary(self):
        self.client.force_authenticate(user=self.admin_user)

        response = self.client.get("/api/v1/dashboards/admin/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["users"][0]["label"], "total")
        self.assertEqual(response.data["properties"][0]["label"], "total")
        self.assertEqual(response.data["verification_access"][0]["label"], "enabled")
