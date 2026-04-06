from django.core.exceptions import ValidationError
from django.db import models

from accounts.models import AgentType, LandlordProfile, TenantProfile, User
from agents.models import AgentAssignmentStatus, PropertyAgentAssignment
from tenancies.models import TenancyStatus


class LegalDocumentStatus(models.TextChoices):
    SUBMITTED = "submitted", "Submitted"
    VERIFIED = "verified", "Verified"
    REJECTED = "rejected", "Rejected"
    EXPIRED = "expired", "Expired"


class TenantLegalDocument(models.Model):
    tenant = models.OneToOneField(
        TenantProfile,
        on_delete=models.CASCADE,
        related_name="legal_document",
    )
    document_type = models.CharField(max_length=100)
    document_number = models.CharField(max_length=100)
    document_url = models.URLField()
    issuing_country = models.CharField(max_length=100, default="Rwanda")
    status = models.CharField(
        max_length=20,
        choices=LegalDocumentStatus.choices,
        default=LegalDocumentStatus.SUBMITTED,
    )
    expires_on = models.DateField(null=True, blank=True)
    notes = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-updated_at",)

    def clean(self):
        if self.expires_on and self.expires_on.year < 1900:
            raise ValidationError("Expiry year looks invalid.")

    def save(self, *args, **kwargs):
        self.full_clean()
        result = super().save(*args, **kwargs)
        TenantProfile.objects.filter(pk=self.tenant_id).update(
            legal_id_type=self.document_type,
            legal_id_number=self.document_number,
            legal_id_document_url=self.document_url,
        )
        return result

    def delete(self, *args, **kwargs):
        tenant_id = self.tenant_id
        result = super().delete(*args, **kwargs)
        TenantProfile.objects.filter(pk=tenant_id).update(
            legal_id_type="",
            legal_id_number="",
            legal_id_document_url="",
        )
        return result

    @classmethod
    def can_admin_view(cls, user):
        return bool(user and user.is_authenticated and (user.is_superuser or user.role == "admin"))

    @classmethod
    def can_landlord_view(cls, landlord, tenant):
        return tenant.tenancies.filter(
            landlord=landlord,
            status=TenancyStatus.ACTIVE,
        ).exists()

    @classmethod
    def can_agent_view(cls, agent, tenant):
        if agent.agent_type != AgentType.PRIVATE:
            return False

        active_property_ids = PropertyAgentAssignment.objects.filter(
            agent=agent,
            status=AgentAssignmentStatus.ACTIVE,
        ).values_list("property_id", flat=True)

        return tenant.tenancies.filter(
            property_id__in=active_property_ids,
            status=TenancyStatus.ACTIVE,
        ).exists()

    def __str__(self):
        return f"{self.tenant.user.full_name} legal document"


class LandlordDocumentVerificationAccess(models.Model):
    landlord = models.OneToOneField(
        LandlordProfile,
        on_delete=models.CASCADE,
        related_name="document_verification_access",
    )
    is_enabled = models.BooleanField(default=False)
    granted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="granted_document_verification_access",
    )
    granted_at = models.DateTimeField(null=True, blank=True)
    provider_code = models.CharField(max_length=100, default="national-registry")
    notes = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("landlord__display_name",)

    def __str__(self):
        status = "enabled" if self.is_enabled else "disabled"
        return f"{self.landlord.display_name} verification access ({status})"
