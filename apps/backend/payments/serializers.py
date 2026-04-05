from rest_framework import serializers

from tenancies.models import Tenancy

from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    tenancy_id = serializers.IntegerField(source="tenancy.id", read_only=True)
    property_title = serializers.CharField(source="tenancy.property.title", read_only=True)
    tenant_name = serializers.CharField(source="tenancy.tenant.user.full_name", read_only=True)
    landlord_name = serializers.CharField(source="tenancy.landlord.display_name", read_only=True)
    outstanding_balance = serializers.DecimalField(
        max_digits=12,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = Payment
        fields = (
            "id",
            "tenancy",
            "tenancy_id",
            "property_title",
            "tenant_name",
            "landlord_name",
            "category",
            "status",
            "method",
            "amount_due",
            "amount_paid",
            "outstanding_balance",
            "currency",
            "due_date",
            "paid_at",
            "reference",
            "notes",
            "created_at",
        )


class PaymentCreateSerializer(serializers.ModelSerializer):
    tenancy = serializers.PrimaryKeyRelatedField(queryset=Tenancy.objects.select_related("property", "tenant__user"))

    class Meta:
        model = Payment
        fields = (
            "tenancy",
            "category",
            "status",
            "method",
            "amount_due",
            "amount_paid",
            "currency",
            "due_date",
            "paid_at",
            "reference",
            "notes",
        )

    def validate(self, attrs):
        amount_due = attrs["amount_due"]
        amount_paid = attrs.get("amount_paid", 0)

        if amount_paid > amount_due:
            raise serializers.ValidationError("Amount paid cannot be greater than amount due.")

        return attrs
