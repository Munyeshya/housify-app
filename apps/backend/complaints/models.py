from django.db import models

from accounts.models import User
from tenancies.models import Tenancy


class ComplaintStatus(models.TextChoices):
    OPEN = "open", "Open"
    IN_REVIEW = "in_review", "In review"
    RESOLVED = "resolved", "Resolved"
    ESCALATED = "escalated", "Escalated"
    CLOSED = "closed", "Closed"


class ComplaintCategory(models.TextChoices):
    MAINTENANCE = "maintenance", "Maintenance"
    PAYMENT = "payment", "Payment"
    BEHAVIOR = "behavior", "Behavior"
    SECURITY = "security", "Security"
    CLEANLINESS = "cleanliness", "Cleanliness"
    OTHER = "other", "Other"


class ComplaintDirection(models.TextChoices):
    TENANT_TO_LANDLORD = "tenant_to_landlord", "Tenant to landlord"
    LANDLORD_TO_TENANT = "landlord_to_tenant", "Landlord to tenant"


class Complaint(models.Model):
    tenancy = models.ForeignKey(
        Tenancy,
        on_delete=models.CASCADE,
        related_name="complaints",
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_complaints",
    )
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_complaints",
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(
        max_length=30,
        choices=ComplaintCategory.choices,
        default=ComplaintCategory.OTHER,
    )
    direction = models.CharField(
        max_length=30,
        choices=ComplaintDirection.choices,
    )
    status = models.CharField(
        max_length=20,
        choices=ComplaintStatus.choices,
        default=ComplaintStatus.OPEN,
    )
    resolution_notes = models.TextField(blank=True)
    opened_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-opened_at",)

    def __str__(self):
        return self.title
