from django.contrib import admin

from .models import TenantLegalDocument


@admin.register(TenantLegalDocument)
class TenantLegalDocumentAdmin(admin.ModelAdmin):
    list_display = ("id", "tenant", "document_type", "status", "uploaded_at", "expires_on")
    search_fields = (
        "tenant__user__full_name",
        "tenant__user__email",
        "document_type",
        "document_number",
    )
    list_filter = ("status", "issuing_country", "uploaded_at")
