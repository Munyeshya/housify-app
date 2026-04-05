from django.contrib import admin

from .models import Portfolio, Property, PropertyImage


class PropertyImageInline(admin.TabularInline):
    model = PropertyImage
    extra = 1


@admin.register(Portfolio)
class PortfolioAdmin(admin.ModelAdmin):
    list_display = ("name", "landlord", "parent", "is_archived")
    search_fields = ("name", "landlord__display_name", "landlord__user__full_name")


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = (
        "title",
        "landlord",
        "property_type",
        "status",
        "is_public",
        "city",
        "rent_amount",
        "currency",
    )
    list_filter = ("property_type", "status", "is_public", "city", "country")
    search_fields = (
        "title",
        "name",
        "city",
        "neighborhood",
        "address_line_1",
        "landlord__display_name",
    )
    inlines = [PropertyImageInline]


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ("property", "caption", "is_cover", "sort_order")
    list_filter = ("is_cover",)
    search_fields = ("property__title", "caption")
