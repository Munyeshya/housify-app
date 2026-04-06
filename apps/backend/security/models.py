from django.conf import settings
from django.db import models


class SecurityEventType(models.TextChoices):
    LOGIN_SUCCESS = "login_success", "Login success"
    LOGIN_FAILURE = "login_failure", "Login failure"
    LOGOUT = "logout", "Logout"
    PAYMENT_CREATED = "payment_created", "Payment created"
    PAYMENT_ADJUSTMENT_CREATED = "payment_adjustment_created", "Payment adjustment created"
    PAYMENT_ADJUSTMENT_DECIDED = "payment_adjustment_decided", "Payment adjustment decided"
    USER_SUSPENDED = "user_suspended", "User suspended"
    USER_REACTIVATED = "user_reactivated", "User reactivated"
    SECURITY_FLAG_CREATED = "security_flag_created", "Security flag created"
    SECURITY_FLAG_RESOLVED = "security_flag_resolved", "Security flag resolved"
    LEGAL_DOCUMENT_ACCESS = "legal_document_access", "Legal document access"
    LANDLORD_VERIFICATION_ACCESS_CHANGED = "landlord_verification_access_changed", "Landlord verification access changed"
    LANDLORD_DOCUMENT_VERIFICATION_REQUESTED = "landlord_document_verification_requested", "Landlord document verification requested"


class SecurityEvent(models.Model):
    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="security_events",
    )
    event_type = models.CharField(max_length=100, choices=SecurityEventType.choices)
    success = models.BooleanField(default=True)
    target_type = models.CharField(max_length=100, blank=True)
    target_id = models.CharField(max_length=100, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.event_type} ({'ok' if self.success else 'failed'})"


class SecurityFlagSeverity(models.TextChoices):
    LOW = "low", "Low"
    MEDIUM = "medium", "Medium"
    HIGH = "high", "High"
    CRITICAL = "critical", "Critical"


class SecurityFlagStatus(models.TextChoices):
    OPEN = "open", "Open"
    UNDER_REVIEW = "under_review", "Under review"
    RESOLVED = "resolved", "Resolved"
    DISMISSED = "dismissed", "Dismissed"


class SecurityFlag(models.Model):
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_security_flags",
    )
    resolved_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="resolved_security_flags",
    )
    target_type = models.CharField(max_length=100)
    target_id = models.CharField(max_length=100)
    severity = models.CharField(max_length=20, choices=SecurityFlagSeverity.choices)
    status = models.CharField(
        max_length=20,
        choices=SecurityFlagStatus.choices,
        default=SecurityFlagStatus.OPEN,
    )
    reason = models.TextField()
    resolution_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"{self.severity} flag on {self.target_type}:{self.target_id}"
