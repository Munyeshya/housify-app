from django.db import models

from accounts.models import LandlordProfile, TenantProfile


class TenantHistoryLookup(models.Model):
    landlord = models.ForeignKey(
        LandlordProfile,
        on_delete=models.CASCADE,
        related_name="tenant_history_lookups",
    )
    tenant = models.ForeignKey(
        TenantProfile,
        on_delete=models.CASCADE,
        related_name="history_lookups",
    )
    tenant_identifier = models.CharField(max_length=64)
    lookup_reason = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.landlord.display_name} looked up {self.tenant.user.full_name}"
