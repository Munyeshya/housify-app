from django.core.exceptions import ValidationError
from django.db import models

from accounts.models import TenantProfile
from properties.models import Property, PropertyStatus


class PropertyBookmark(models.Model):
    tenant = models.ForeignKey(
        TenantProfile,
        on_delete=models.CASCADE,
        related_name="bookmarks",
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="bookmarks",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(
                fields=["tenant", "property"],
                name="unique_property_bookmark_per_tenant",
            ),
        ]

    def clean(self):
        if not self.property.is_public:
            raise ValidationError("Only public properties can be bookmarked.")

        if self.property.status in {
            PropertyStatus.DRAFT,
            PropertyStatus.ARCHIVED,
            PropertyStatus.HIDDEN,
        }:
            raise ValidationError("Only visible public properties can be bookmarked.")

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.tenant.user.full_name} bookmarked {self.property.title}"
