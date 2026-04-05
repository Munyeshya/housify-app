from django.contrib import admin

from .models import Complaint


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "tenancy",
        "category",
        "direction",
        "status",
        "created_by",
        "assigned_to",
        "opened_at",
    )
    list_filter = ("category", "direction", "status")
    search_fields = (
        "title",
        "tenancy__property__title",
        "tenancy__tenant__user__full_name",
    )
