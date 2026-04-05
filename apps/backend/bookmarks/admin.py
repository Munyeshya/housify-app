from django.contrib import admin

from .models import PropertyBookmark


@admin.register(PropertyBookmark)
class PropertyBookmarkAdmin(admin.ModelAdmin):
    list_display = ("id", "tenant", "property", "created_at")
    search_fields = ("tenant__user__full_name", "tenant__user__email", "property__title")
    list_filter = ("created_at",)
