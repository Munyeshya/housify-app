from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import LandlordProfile, TenantProfile, User, UserRole
from complaints.models import Complaint, ComplaintCategory, ComplaintDirection, ComplaintStatus
from payments.models import Payment, PaymentCategory, PaymentMethod, PaymentStatus
from properties.models import BillingCycle, Property, PropertyStatus, PropertyType
from tenancies.models import Tenancy, TenancyStatus

from .models import TenantHistoryLookup


class TenantHistoryApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        landlord_user = User.objects.create_user(
            email="landlord@example.com",
            password="password123",
            role=UserRole.LANDLORD,
            full_name="Landlord One",
        )
        self.landlord = LandlordProfile.objects.create(user=landlord_user, display_name="Landlord One")

        other_landlord_user = User.objects.create_user(
            email="other-landlord@example.com",
            password="password123",
            role=UserRole.LANDLORD,
            full_name="Landlord Two",
        )
        self.other_landlord = LandlordProfile.objects.create(
            user=other_landlord_user,
            display_name="Landlord Two",
        )

        tenant_user = User.objects.create_user(
            email="tenant@example.com",
            password="password123",
            role=UserRole.TENANT,
            full_name="Tenant One",
        )
        self.tenant = TenantProfile.objects.create(
            user=tenant_user,
            legal_id_type="National ID",
            legal_id_number="1199980012345678",
            legal_id_document_url="https://example.com/legal-id.pdf",
        )

        property_one = Property.objects.create(
            landlord=self.landlord,
            name="green-heights",
            title="Green Heights Apartments",
            short_description="Primary residence",
            description="A visible property for history testing.",
            property_type=PropertyType.APARTMENT,
            status=PropertyStatus.AVAILABLE,
            is_public=True,
            address_line_1="KG 10 Ave",
            city="Kigali",
            rent_amount=300000,
            currency="RWF",
            billing_cycle=BillingCycle.MONTHLY,
        )
        property_two = Property.objects.create(
            landlord=self.other_landlord,
            name="gold-villa",
            title="Gold Villa",
            short_description="Former residence",
            description="A prior residence under another landlord.",
            property_type=PropertyType.HOUSE,
            status=PropertyStatus.AVAILABLE,
            is_public=True,
            address_line_1="KG 20 Ave",
            city="Kigali",
            rent_amount=700000,
            currency="RWF",
            billing_cycle=BillingCycle.MONTHLY,
        )

        self.active_tenancy = Tenancy.objects.create(
            landlord=self.landlord,
            property=property_one,
            tenant=self.tenant,
            assigned_by=landlord_user,
            status=TenancyStatus.ACTIVE,
            start_date="2026-04-01",
            monthly_rent_snapshot=300000,
            security_deposit_snapshot=300000,
            billing_cycle_snapshot=BillingCycle.MONTHLY,
        )
        self.completed_tenancy = Tenancy.objects.create(
            landlord=self.other_landlord,
            property=property_two,
            tenant=self.tenant,
            assigned_by=other_landlord_user,
            status=TenancyStatus.COMPLETED,
            start_date="2025-01-01",
            end_date="2025-12-31",
            move_out_date="2025-12-31",
            monthly_rent_snapshot=700000,
            security_deposit_snapshot=700000,
            billing_cycle_snapshot=BillingCycle.MONTHLY,
        )

        Payment.objects.create(
            tenancy=self.active_tenancy,
            category=PaymentCategory.RENT,
            status=PaymentStatus.PAID,
            method=PaymentMethod.MOBILE_MONEY,
            amount_due=300000,
            amount_paid=300000,
            currency="RWF",
            reference="PAY-001",
        )
        Complaint.objects.create(
            tenancy=self.active_tenancy,
            created_by=tenant_user,
            assigned_to=landlord_user,
            title="Water leak",
            description="Kitchen sink leaking",
            category=ComplaintCategory.MAINTENANCE,
            direction=ComplaintDirection.TENANT_TO_LANDLORD,
            status=ComplaintStatus.OPEN,
        )

    def test_landlord_can_lookup_tenant_history_by_identifier(self):
        self.client.force_authenticate(user=self.landlord.user)
        response = self.client.post(
            "/api/v1/history/lookup/",
            {
                "landlord": self.landlord.id,
                "tenant_identifier": str(self.tenant.tenant_identifier),
                "lookup_reason": "Prospective assignment review",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(TenantHistoryLookup.objects.count(), 1)
        self.assertEqual(response.data["summary"]["tenant_name"], self.tenant.user.full_name)
        self.assertEqual(response.data["summary"]["total_tenancies"], 2)
        self.assertEqual(response.data["summary"]["active_tenancies"], 1)
        self.assertEqual(response.data["summary"]["completed_tenancies"], 1)
        active_entry = next(
            entry
            for entry in response.data["summary"]["history"]
            if entry["property_title"] == self.active_tenancy.property.title
        )
        self.assertEqual(active_entry["payments_count"], 1)
        self.assertEqual(active_entry["complaints_count"], 1)

    def test_lookup_fails_for_unknown_identifier(self):
        self.client.force_authenticate(user=self.landlord.user)
        response = self.client.post(
            "/api/v1/history/lookup/",
            {
                "landlord": self.landlord.id,
                "tenant_identifier": "TNT-XXXXXX",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(TenantHistoryLookup.objects.count(), 0)

    def test_lookup_list_can_be_filtered_by_landlord(self):
        TenantHistoryLookup.objects.create(
            landlord=self.landlord,
            tenant=self.tenant,
            tenant_identifier=self.tenant.tenant_identifier,
            lookup_reason="Review one",
        )
        TenantHistoryLookup.objects.create(
            landlord=self.other_landlord,
            tenant=self.tenant,
            tenant_identifier=self.tenant.tenant_identifier,
            lookup_reason="Review two",
        )
        self.client.force_authenticate(user=self.landlord.user)

        response = self.client.get("/api/v1/history/lookups/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)
        self.assertEqual(response.data["results"][0]["landlord"], self.landlord.id)

    def test_history_summary_does_not_expose_legal_id_document(self):
        self.client.force_authenticate(user=self.landlord.user)
        response = self.client.post(
            "/api/v1/history/lookup/",
            {
                "landlord": self.landlord.id,
                "tenant_identifier": str(self.tenant.tenant_identifier),
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data["summary"]["has_legal_id_document"])
        self.assertNotIn("legal_id_document_url", response.data["summary"])
