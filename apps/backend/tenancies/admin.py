from django.contrib import admin

from .models import Tenancy


@admin.register(Tenancy)
class TenancyAdmin(admin.ModelAdmin):
    list_display = (
        "property",
        "tenant",
        "landlord",
        "status",
        "start_date",
        "end_date",
    )
    list_filter = ("status", "start_date", "end_date")
    search_fields = (
        "property__title",
        "tenant__user__full_name",
        "tenant__tenant_identifier",
        "landlord__display_name",
    )
