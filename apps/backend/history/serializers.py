from rest_framework import serializers

from accounts.models import LandlordProfile, TenantProfile
from tenancies.models import Tenancy, TenancyStatus

from .models import TenantHistoryLookup


class TenantHistoryEntrySerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)
    property_reference = serializers.UUIDField(source="property.property_reference", read_only=True)
    property_type = serializers.CharField(source="property.property_type", read_only=True)
    property_city = serializers.CharField(source="property.city", read_only=True)
    landlord_name = serializers.CharField(source="landlord.display_name", read_only=True)
    payments_count = serializers.SerializerMethodField()
    complaints_count = serializers.SerializerMethodField()

    class Meta:
        model = Tenancy
        fields = (
            "id",
            "property_title",
            "property_reference",
            "property_type",
            "property_city",
            "landlord",
            "landlord_name",
            "status",
            "start_date",
            "end_date",
            "move_out_date",
            "monthly_rent_snapshot",
            "security_deposit_snapshot",
            "billing_cycle_snapshot",
            "payments_count",
            "complaints_count",
            "notes",
        )

    def get_payments_count(self, obj):
        return obj.payments.count()

    def get_complaints_count(self, obj):
        return obj.complaints.count()


class TenantHistoryLookupSerializer(serializers.ModelSerializer):
    landlord_name = serializers.CharField(source="landlord.display_name", read_only=True)
    tenant_name = serializers.CharField(source="tenant.user.full_name", read_only=True)

    class Meta:
        model = TenantHistoryLookup
        fields = (
            "id",
            "landlord",
            "landlord_name",
            "tenant",
            "tenant_name",
            "tenant_identifier",
            "lookup_reason",
            "created_at",
        )


class TenantHistoryLookupCreateSerializer(serializers.Serializer):
    landlord = serializers.PrimaryKeyRelatedField(queryset=LandlordProfile.objects.select_related("user"))
    tenant_identifier = serializers.UUIDField()
    lookup_reason = serializers.CharField(max_length=255, allow_blank=True, required=False)

    def validate(self, attrs):
        tenant_identifier = attrs["tenant_identifier"]
        try:
            tenant = TenantProfile.objects.select_related("user").get(tenant_identifier=tenant_identifier)
        except TenantProfile.DoesNotExist as exc:
            raise serializers.ValidationError("No tenant was found for the provided identifier.") from exc

        attrs["tenant"] = tenant
        return attrs

    def create(self, validated_data):
        return TenantHistoryLookup.objects.create(
            landlord=validated_data["landlord"],
            tenant=validated_data["tenant"],
            tenant_identifier=validated_data["tenant_identifier"],
            lookup_reason=validated_data.get("lookup_reason", ""),
        )


class TenantHistorySummarySerializer(serializers.Serializer):
    tenant_name = serializers.CharField()
    tenant_identifier = serializers.UUIDField()
    has_legal_id_document = serializers.BooleanField()
    total_tenancies = serializers.IntegerField()
    active_tenancies = serializers.IntegerField()
    completed_tenancies = serializers.IntegerField()
    terminated_tenancies = serializers.IntegerField()
    history = TenantHistoryEntrySerializer(many=True)

    @classmethod
    def build(cls, tenant, tenancies):
        return {
            "tenant_name": tenant.user.full_name,
            "tenant_identifier": tenant.tenant_identifier,
            "has_legal_id_document": tenant.has_legal_id_document,
            "total_tenancies": len(tenancies),
            "active_tenancies": sum(1 for tenancy in tenancies if tenancy.status == TenancyStatus.ACTIVE),
            "completed_tenancies": sum(1 for tenancy in tenancies if tenancy.status == TenancyStatus.COMPLETED),
            "terminated_tenancies": sum(1 for tenancy in tenancies if tenancy.status == TenancyStatus.TERMINATED),
            "history": tenancies,
        }
