from django.conf import settings
from django.db import models


class SecurityEventType(models.TextChoices):
    LOGIN_SUCCESS = "login_success", "Login success"
    LOGIN_FAILURE = "login_failure", "Login failure"
    LOGOUT = "logout", "Logout"
    PAYMENT_CREATED = "payment_created", "Payment created"
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
