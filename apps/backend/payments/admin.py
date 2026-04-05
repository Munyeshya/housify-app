from django.contrib import admin

from .models import Payment


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "tenancy",
        "category",
        "status",
        "method",
        "amount_due",
        "amount_paid",
        "currency",
        "due_date",
    )
    list_filter = ("category", "status", "method", "currency")
    search_fields = (
        "tenancy__property__title",
        "tenancy__tenant__user__full_name",
        "reference",
    )
