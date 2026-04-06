from rest_framework import serializers

from tenancies.models import Tenancy

from .models import (
    Payment,
    PaymentAdjustment,
    PaymentAdjustmentStatus,
    PaymentAdjustmentType,
    PaymentSource,
    PaymentVerificationStatus,
)


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
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)
    approved_by_name = serializers.CharField(source="approved_by.full_name", read_only=True)

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
            "external_reference",
            "idempotency_key",
            "source",
            "verification_status",
            "created_by",
            "created_by_name",
            "approved_by",
            "approved_by_name",
            "approved_at",
            "notes",
            "created_at",
        )
        read_only_fields = (
            "created_by",
            "approved_by",
            "approved_at",
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
            "external_reference",
            "idempotency_key",
            "source",
            "notes",
        )

    def validate(self, attrs):
        amount_due = attrs["amount_due"]
        amount_paid = attrs.get("amount_paid", 0)

        if amount_paid > amount_due:
            raise serializers.ValidationError("Amount paid cannot be greater than amount due.")

        return attrs


class PaymentAdjustmentSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)
    approved_by_name = serializers.CharField(source="approved_by.full_name", read_only=True)

    class Meta:
        model = PaymentAdjustment
        fields = (
            "id",
            "payment",
            "adjustment_type",
            "status",
            "amount_delta",
            "reason",
            "created_by",
            "created_by_name",
            "approved_by",
            "approved_by_name",
            "approved_at",
            "created_at",
            "updated_at",
        )
        read_only_fields = (
            "created_by",
            "approved_by",
            "approved_at",
            "created_at",
            "updated_at",
        )


class PaymentAdjustmentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentAdjustment
        fields = (
            "payment",
            "adjustment_type",
            "amount_delta",
            "reason",
        )

    def validate(self, attrs):
        if attrs["amount_delta"] == 0:
            raise serializers.ValidationError("Amount delta cannot be zero.")
        return attrs


class PaymentAdjustmentDecisionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[
            PaymentAdjustmentStatus.APPLIED,
            PaymentAdjustmentStatus.REJECTED,
        ]
    )


class PaymentIntegritySummarySerializer(serializers.Serializer):
    payment = PaymentSerializer()
    adjustments = PaymentAdjustmentSerializer(many=True)
    effective_amount_paid = serializers.DecimalField(max_digits=12, decimal_places=2)
    effective_outstanding_balance = serializers.DecimalField(max_digits=12, decimal_places=2)
