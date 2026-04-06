from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

from tenancies.models import Tenancy


class PaymentStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    PAID = "paid", "Paid"
    PARTIAL = "partial", "Partial"
    FAILED = "failed", "Failed"
    REFUNDED = "refunded", "Refunded"
    VOIDED = "voided", "Voided"


class PaymentCategory(models.TextChoices):
    RENT = "rent", "Rent"
    DEPOSIT = "deposit", "Deposit"
    SERVICE_CHARGE = "service_charge", "Service charge"
    LATE_FEE = "late_fee", "Late fee"
    OTHER = "other", "Other"


class PaymentMethod(models.TextChoices):
    CASH = "cash", "Cash"
    BANK_TRANSFER = "bank_transfer", "Bank transfer"
    MOBILE_MONEY = "mobile_money", "Mobile money"
    CARD = "card", "Card"
    OTHER = "other", "Other"


class PaymentSource(models.TextChoices):
    MANUAL = "manual", "Manual"
    MOBILE_COLLECTION = "mobile_collection", "Mobile collection"
    BANK_RECONCILIATION = "bank_reconciliation", "Bank reconciliation"
    IMPORTED = "imported", "Imported"


class PaymentVerificationStatus(models.TextChoices):
    UNVERIFIED = "unverified", "Unverified"
    VERIFIED = "verified", "Verified"
    DISPUTED = "disputed", "Disputed"


class PaymentAdjustmentType(models.TextChoices):
    CORRECTION = "correction", "Correction"
    REVERSAL = "reversal", "Reversal"
    WRITE_OFF = "write_off", "Write off"


class PaymentAdjustmentStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    APPLIED = "applied", "Applied"
    REJECTED = "rejected", "Rejected"


class Payment(models.Model):
    tenancy = models.ForeignKey(
        Tenancy,
        on_delete=models.CASCADE,
        related_name="payments",
    )
    category = models.CharField(
        max_length=30,
        choices=PaymentCategory.choices,
        default=PaymentCategory.RENT,
    )
    status = models.CharField(
        max_length=20,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
    )
    method = models.CharField(
        max_length=30,
        choices=PaymentMethod.choices,
        default=PaymentMethod.OTHER,
    )
    amount_due = models.DecimalField(max_digits=12, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=10, default="RWF")
    due_date = models.DateField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    reference = models.CharField(max_length=100, blank=True)
    external_reference = models.CharField(max_length=100, blank=True)
    idempotency_key = models.CharField(max_length=100, null=True, blank=True, unique=True)
    source = models.CharField(
        max_length=30,
        choices=PaymentSource.choices,
        default=PaymentSource.MANUAL,
    )
    verification_status = models.CharField(
        max_length=20,
        choices=PaymentVerificationStatus.choices,
        default=PaymentVerificationStatus.UNVERIFIED,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_payments",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_payments",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    @property
    def outstanding_balance(self):
        return self.amount_due - self.amount_paid

    def clean(self):
        if self.amount_paid > self.amount_due:
            raise ValidationError("Amount paid cannot be greater than amount due.")

        if self.pk and not getattr(self, "_allow_protected_update", False):
            original = Payment.objects.get(pk=self.pk)
            protected_fields = (
                "tenancy_id",
                "category",
                "method",
                "amount_due",
                "amount_paid",
                "currency",
                "reference",
                "external_reference",
                "source",
                "created_by_id",
                "idempotency_key",
            )
            changed_fields = [
                field for field in protected_fields if getattr(original, field) != getattr(self, field)
            ]
            if changed_fields:
                raise ValidationError(
                    "Protected payment fields cannot be edited directly. Use a payment adjustment instead."
                )

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        raise ValidationError("Payments are immutable and cannot be deleted directly.")

    def __str__(self):
        return f"{self.category} payment for {self.tenancy.property.title}"


class PaymentAdjustment(models.Model):
    payment = models.ForeignKey(
        Payment,
        on_delete=models.CASCADE,
        related_name="adjustments",
    )
    adjustment_type = models.CharField(max_length=30, choices=PaymentAdjustmentType.choices)
    status = models.CharField(
        max_length=20,
        choices=PaymentAdjustmentStatus.choices,
        default=PaymentAdjustmentStatus.PENDING,
    )
    amount_delta = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.TextField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_payment_adjustments",
    )
    approved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="approved_payment_adjustments",
    )
    approved_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.adjustment_type} for payment {self.payment_id}"
