from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import LandlordProfile, TenantProfile, User, UserRole
from payments.models import (
    Payment,
    PaymentAdjustment,
    PaymentAdjustmentStatus,
    PaymentAdjustmentType,
    PaymentCategory,
    PaymentMethod,
    PaymentSource,
    PaymentStatus,
    PaymentVerificationStatus,
)
from properties.models import BillingCycle, Property, PropertyStatus, PropertyType
from tenancies.models import Tenancy, TenancyStatus


class PaymentsIntegrityApiTests(TestCase):
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
        self.tenant = TenantProfile.objects.create(
            user=self.tenant_user,
            legal_id_type="National ID",
            legal_id_number="1199980012345678",
            legal_id_document_url="https://example.com/legal-id.pdf",
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
        self.payment = Payment.objects.create(
            tenancy=self.tenancy,
            category=PaymentCategory.RENT,
            status=PaymentStatus.PAID,
            method=PaymentMethod.MOBILE_MONEY,
            amount_due=300000,
            amount_paid=300000,
            currency="RWF",
            source=PaymentSource.MANUAL,
            verification_status=PaymentVerificationStatus.UNVERIFIED,
            created_by=self.landlord_user,
            reference="PAY-001",
        )

    def test_payment_protected_fields_cannot_be_edited_directly(self):
        self.payment.amount_paid = 250000

        with self.assertRaises(ValidationError):
            self.payment.save()

    def test_payment_cannot_be_deleted_directly(self):
        with self.assertRaises(ValidationError):
            self.payment.delete()

    def test_landlord_can_create_payment_adjustment_request(self):
        self.client.force_authenticate(user=self.landlord_user)

        response = self.client.post(
            "/api/v1/payments/adjustments/",
            {
                "payment": self.payment.id,
                "adjustment_type": PaymentAdjustmentType.CORRECTION,
                "amount_delta": "-50000.00",
                "reason": "Duplicate rent entry needs correction.",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(PaymentAdjustment.objects.count(), 1)
        self.assertEqual(PaymentAdjustment.objects.first().status, PaymentAdjustmentStatus.PENDING)

    def test_admin_can_apply_payment_adjustment(self):
        adjustment = PaymentAdjustment.objects.create(
            payment=self.payment,
            adjustment_type=PaymentAdjustmentType.CORRECTION,
            amount_delta=-50000,
            reason="Duplicate entry correction",
            created_by=self.landlord_user,
        )

        self.client.force_authenticate(user=self.admin_user)
        response = self.client.post(
            f"/api/v1/payments/adjustments/{adjustment.id}/decision/",
            {"status": PaymentAdjustmentStatus.APPLIED},
            format="json",
        )

        self.payment.refresh_from_db()
        adjustment.refresh_from_db()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(adjustment.status, PaymentAdjustmentStatus.APPLIED)
        self.assertEqual(self.payment.amount_paid, 250000)
        self.assertEqual(self.payment.status, PaymentStatus.PARTIAL)
        self.assertEqual(self.payment.verification_status, PaymentVerificationStatus.DISPUTED)

    def test_payment_integrity_summary_includes_adjustments(self):
        PaymentAdjustment.objects.create(
            payment=self.payment,
            adjustment_type=PaymentAdjustmentType.CORRECTION,
            amount_delta=-50000,
            reason="Duplicate entry correction",
            created_by=self.landlord_user,
            status=PaymentAdjustmentStatus.PENDING,
        )

        self.client.force_authenticate(user=self.landlord_user)
        response = self.client.get(f"/api/v1/payments/{self.payment.id}/integrity/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["payment"]["id"], self.payment.id)
        self.assertEqual(len(response.data["adjustments"]), 1)
        self.assertEqual(response.data["effective_amount_paid"], "300000.00")
