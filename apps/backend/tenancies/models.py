from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q

from accounts.models import LandlordProfile, TenantProfile, User
from properties.models import Property, PropertyStatus


class TenancyStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    ACTIVE = "active", "Active"
    COMPLETED = "completed", "Completed"
    TERMINATED = "terminated", "Terminated"


OPEN_TENANCY_STATUSES = {TenancyStatus.PENDING, TenancyStatus.ACTIVE}
CLOSED_TENANCY_STATUSES = {TenancyStatus.COMPLETED, TenancyStatus.TERMINATED}


class Tenancy(models.Model):
    landlord = models.ForeignKey(
        LandlordProfile,
        on_delete=models.CASCADE,
        related_name="tenancies",
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="tenancies",
    )
    tenant = models.ForeignKey(
        TenantProfile,
        on_delete=models.CASCADE,
        related_name="tenancies",
    )
    assigned_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_tenancies",
    )
    status = models.CharField(
        max_length=20,
        choices=TenancyStatus.choices,
        default=TenancyStatus.PENDING,
    )
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    move_out_date = models.DateField(null=True, blank=True)
    monthly_rent_snapshot = models.DecimalField(max_digits=12, decimal_places=2)
    security_deposit_snapshot = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    billing_cycle_snapshot = models.CharField(max_length=20)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(
                fields=["property"],
                condition=Q(status__in=[TenancyStatus.PENDING, TenancyStatus.ACTIVE]),
                name="unique_open_tenancy_per_property",
            ),
        ]

    def clean(self):
        if self.property.landlord_id != self.landlord_id:
            raise ValidationError("The tenancy landlord must match the property's landlord.")

        if not self.tenant.has_legal_id_document:
            raise ValidationError("A tenant cannot be assigned without a legal ID document.")

        if self.end_date and self.end_date < self.start_date:
            raise ValidationError("End date cannot be earlier than start date.")

        if self.move_out_date and self.move_out_date < self.start_date:
            raise ValidationError("Move-out date cannot be earlier than start date.")

    def save(self, *args, **kwargs):
        previous_status = None
        if self.pk:
            previous_status = (
                type(self).objects.filter(pk=self.pk).values_list("status", flat=True).first()
            )

        self.full_clean()
        super().save(*args, **kwargs)

        if self.status == TenancyStatus.ACTIVE:
            self.property.status = PropertyStatus.OCCUPIED
        elif self.status in {TenancyStatus.COMPLETED, TenancyStatus.TERMINATED}:
            self.property.status = PropertyStatus.AVAILABLE
        else:
            self.property.status = PropertyStatus.AVAILABLE

        self.property.save(update_fields=["status", "updated_at"])

        if previous_status in OPEN_TENANCY_STATUSES and self.status in CLOSED_TENANCY_STATUSES:
            has_remaining_open_tenancy = self.tenant.tenancies.filter(
                status__in=OPEN_TENANCY_STATUSES
            ).exists()
            if not has_remaining_open_tenancy:
                self.tenant.rotate_tenant_identifier()

    def __str__(self):
        return f"{self.tenant.user.full_name} - {self.property.title}"
