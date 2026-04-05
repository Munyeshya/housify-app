from django.contrib import admin

from .models import TenantHistoryLookup


@admin.register(TenantHistoryLookup)
class TenantHistoryLookupAdmin(admin.ModelAdmin):
    list_display = ("id", "landlord", "tenant", "tenant_identifier", "created_at")
    search_fields = (
        "landlord__display_name",
        "tenant__user__full_name",
        "tenant__user__email",
    )
    list_filter = ("created_at",)
