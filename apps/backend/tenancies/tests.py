from django.test import TestCase
from decimal import Decimal
from rest_framework.test import APIClient

from accounts.models import LandlordProfile, TenantProfile, User, UserRole
from payments.models import Payment, PaymentCategory, PaymentMethod, PaymentStatus
from properties.models import BillingCycle, Property, PropertyStatus, PropertyType

from .models import Tenancy, TenancyStatus


class TenantIdentifierRotationTests(TestCase):
    def setUp(self):
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
        self.tenant = TenantProfile.objects.create(
            user=self.tenant_user,
            legal_id_type="National ID",
            legal_id_number="1199980012345678",
            legal_id_document_url="https://example.com/legal-id.pdf",
        )

        self.property_one = Property.objects.create(
            landlord=self.landlord,
            name="green-heights",
            title="Green Heights Apartments",
            short_description="Primary residence",
            description="A visible property for identifier rotation tests.",
            property_type=PropertyType.APARTMENT,
            status=PropertyStatus.AVAILABLE,
            is_public=True,
            address_line_1="KG 10 Ave",
            city="Kigali",
            rent_amount=300000,
            currency="RWF",
            billing_cycle=BillingCycle.MONTHLY,
        )
        self.property_two = Property.objects.create(
            landlord=self.landlord,
            name="sunrise-estate",
            title="Sunrise Estate",
            short_description="Secondary residence",
            description="Another property for identifier rotation tests.",
            property_type=PropertyType.HOUSE,
            status=PropertyStatus.AVAILABLE,
            is_public=True,
            address_line_1="KG 22 Ave",
            city="Kigali",
            rent_amount=500000,
            currency="RWF",
            billing_cycle=BillingCycle.MONTHLY,
        )

    def test_identifier_rotates_when_last_open_tenancy_closes(self):
        tenancy = Tenancy.objects.create(
            landlord=self.landlord,
            property=self.property_one,
            tenant=self.tenant,
            assigned_by=self.landlord_user,
            status=TenancyStatus.ACTIVE,
            start_date="2026-04-01",
            monthly_rent_snapshot=300000,
            security_deposit_snapshot=300000,
            billing_cycle_snapshot=BillingCycle.MONTHLY,
        )
        original_identifier = self.tenant.tenant_identifier

        tenancy.status = TenancyStatus.TERMINATED
        tenancy.move_out_date = "2026-05-01"
        tenancy.save()

        self.tenant.refresh_from_db()
        self.assertNotEqual(self.tenant.tenant_identifier, original_identifier)

    def test_identifier_does_not_rotate_while_another_open_tenancy_exists(self):
        first_tenancy = Tenancy.objects.create(
            landlord=self.landlord,
            property=self.property_one,
            tenant=self.tenant,
            assigned_by=self.landlord_user,
            status=TenancyStatus.ACTIVE,
            start_date="2026-04-01",
            monthly_rent_snapshot=300000,
            security_deposit_snapshot=300000,
            billing_cycle_snapshot=BillingCycle.MONTHLY,
        )
        Tenancy.objects.create(
            landlord=self.landlord,
            property=self.property_two,
            tenant=self.tenant,
            assigned_by=self.landlord_user,
            status=TenancyStatus.PENDING,
            start_date="2026-05-01",
            monthly_rent_snapshot=500000,
            security_deposit_snapshot=500000,
            billing_cycle_snapshot=BillingCycle.MONTHLY,
        )
        original_identifier = self.tenant.tenant_identifier

        first_tenancy.status = TenancyStatus.COMPLETED
        first_tenancy.end_date = "2026-04-30"
        first_tenancy.move_out_date = "2026-04-30"
        first_tenancy.save()

        self.tenant.refresh_from_db()
        self.assertEqual(self.tenant.tenant_identifier, original_identifier)


class TenantTenancyHistoryApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.landlord_user = User.objects.create_user(
            email="landlord-history@example.com",
            password="password123",
            role=UserRole.LANDLORD,
            full_name="Landlord History",
        )
        self.landlord = LandlordProfile.objects.create(user=self.landlord_user, display_name="Landlord History")

        self.tenant_user = User.objects.create_user(
            email="tenant-history@example.com",
            password="password123",
            role=UserRole.TENANT,
            full_name="Tenant History",
        )
        self.tenant = TenantProfile.objects.create(
            user=self.tenant_user,
            legal_id_type="National ID",
            legal_id_number="1199980012345678",
            legal_id_document_url="https://example.com/legal-id.pdf",
        )

        self.property = Property.objects.create(
            landlord=self.landlord,
            name="history-home",
            title="History Home",
            short_description="Residence history property",
            description="Used to verify tenant history fields.",
            property_type=PropertyType.HOUSE,
            status=PropertyStatus.AVAILABLE,
            is_public=True,
            address_line_1="KG 44 Ave",
            neighborhood="Remera",
            district="Gasabo",
            city="Kigali",
            rent_amount=450000,
            currency="RWF",
            billing_cycle=BillingCycle.MONTHLY,
        )

    def test_tenant_tenancy_list_includes_duration_and_amount_spent(self):
        tenancy = Tenancy.objects.create(
            landlord=self.landlord,
            property=self.property,
            tenant=self.tenant,
            assigned_by=self.landlord_user,
            status=TenancyStatus.COMPLETED,
            start_date="2026-01-01",
            end_date="2026-03-31",
            move_out_date="2026-03-31",
            monthly_rent_snapshot=450000,
            security_deposit_snapshot=450000,
            billing_cycle_snapshot=BillingCycle.MONTHLY,
        )
        Payment.objects.create(
            tenancy=tenancy,
            category=PaymentCategory.RENT,
            status=PaymentStatus.PAID,
            method=PaymentMethod.MOBILE_MONEY,
            amount_due=450000,
            amount_paid=450000,
            currency="RWF",
            reference="PAY-H1",
        )
        Payment.objects.create(
            tenancy=tenancy,
            category=PaymentCategory.RENT,
            status=PaymentStatus.PAID,
            method=PaymentMethod.BANK_TRANSFER,
            amount_due=450000,
            amount_paid=300000,
            currency="RWF",
            reference="PAY-H2",
        )

        self.client.force_authenticate(user=self.tenant_user)
        response = self.client.get("/api/v1/tenancies/")

        self.assertEqual(response.status_code, 200)
        payload = response.data["results"][0]
        self.assertEqual(payload["property_location"], "KG 44 Ave, Remera, Gasabo, Kigali")
        self.assertEqual(payload["amount_paid_total"], Decimal("750000.00"))
        self.assertEqual(payload["payments_recorded"], 2)
        self.assertEqual(payload["occupancy_duration_days"], 90)
        self.assertEqual(payload["occupancy_duration_label"], "3 months")
