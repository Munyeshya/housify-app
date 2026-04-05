import builtins

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q

from accounts.models import AgentProfile, AgentType, LandlordProfile, User
from properties.models import Property


class AgentAssignmentStatus(models.TextChoices):
    ACTIVE = "active", "Active"
    REVOKED = "revoked", "Revoked"
    PENDING = "pending", "Pending"


class PropertyAgentAssignment(models.Model):
    landlord = models.ForeignKey(
        LandlordProfile,
        on_delete=models.CASCADE,
        related_name="agent_assignments",
    )
    agent = models.ForeignKey(
        AgentProfile,
        on_delete=models.CASCADE,
        related_name="property_assignments",
    )
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="agent_assignments",
    )
    status = models.CharField(
        max_length=20,
        choices=AgentAssignmentStatus.choices,
        default=AgentAssignmentStatus.ACTIVE,
    )
    granted_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="granted_agent_assignments",
    )
    granted_at = models.DateTimeField(auto_now_add=True)
    revoked_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-granted_at",)
        constraints = [
            models.UniqueConstraint(
                fields=["agent", "property"],
                condition=Q(status=AgentAssignmentStatus.ACTIVE),
                name="unique_active_agent_assignment_per_property",
            ),
        ]

    def clean(self):
        if self.property.landlord_id != self.landlord_id:
            raise ValidationError("The assigned property must belong to the landlord.")

        if self.agent.user.role != "agent":
            raise ValidationError("Only agent accounts can receive property assignments.")

        if self.agent.agent_type == AgentType.PRIVATE and self.agent.created_by_landlord_id != self.landlord_id:
            raise ValidationError("Private agents can only be assigned by the landlord who created them.")

        if self.status == AgentAssignmentStatus.ACTIVE:
            duplicate_exists = PropertyAgentAssignment.objects.filter(
                agent=self.agent,
                property=self.property,
                status=AgentAssignmentStatus.ACTIVE,
            ).exclude(pk=self.pk).exists()
            if duplicate_exists:
                raise ValidationError("This agent already has active access to the property.")

    @builtins.property
    def can_view_payments(self):
        return True

    @builtins.property
    def can_view_complaints(self):
        return True

    @builtins.property
    def can_view_occupancy(self):
        return True

    @builtins.property
    def can_view_legal_id(self):
        return self.agent.agent_type == AgentType.PRIVATE

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.agent.user.full_name} -> {self.property.title}"
