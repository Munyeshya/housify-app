from django.contrib import admin

from .models import PropertyAgentAssignment


@admin.register(PropertyAgentAssignment)
class PropertyAgentAssignmentAdmin(admin.ModelAdmin):
    list_display = (
        "agent",
        "property",
        "landlord",
        "status",
        "granted_by",
        "granted_at",
        "revoked_at",
    )
    list_filter = ("status",)
    search_fields = (
        "agent__user__full_name",
        "property__title",
        "landlord__display_name",
    )
