from django.db import models

from tenancies.models import Tenancy


class PaymentStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    PAID = "paid", "Paid"
    PARTIAL = "partial", "Partial"
    FAILED = "failed", "Failed"
    REFUNDED = "refunded", "Refunded"


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
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    @property
    def outstanding_balance(self):
        return self.amount_due - self.amount_paid

    def __str__(self):
        return f"{self.category} payment for {self.tenancy.property.title}"
