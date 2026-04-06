from rest_framework import serializers

from accounts.models import TenantProfile
from properties.models import Property

from .models import Tenancy, TenancyStatus


class TenancySerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)
    tenant_name = serializers.CharField(source="tenant.user.full_name", read_only=True)
    tenant_identifier = serializers.UUIDField(source="tenant.tenant_identifier", read_only=True)
    landlord_name = serializers.CharField(source="landlord.display_name", read_only=True)

    class Meta:
        model = Tenancy
        fields = (
            "id",
            "property",
            "property_title",
            "tenant",
            "tenant_name",
            "tenant_identifier",
            "landlord",
            "landlord_name",
            "status",
            "start_date",
            "end_date",
            "move_out_date",
            "monthly_rent_snapshot",
            "security_deposit_snapshot",
            "billing_cycle_snapshot",
            "notes",
            "created_at",
        )


class TenancyCreateSerializer(serializers.ModelSerializer):
    property = serializers.PrimaryKeyRelatedField(queryset=Property.objects.all())
    tenant = serializers.PrimaryKeyRelatedField(queryset=TenantProfile.objects.select_related("user"))

    class Meta:
        model = Tenancy
        fields = (
            "property",
            "tenant",
            "status",
            "start_date",
            "end_date",
            "move_out_date",
            "monthly_rent_snapshot",
            "security_deposit_snapshot",
            "billing_cycle_snapshot",
            "notes",
        )

    def validate(self, attrs):
        property_obj = attrs["property"]
        landlord = self.context["landlord"]
        tenant = attrs["tenant"]

        if property_obj.landlord_id != landlord.id:
            raise serializers.ValidationError("This property does not belong to the provided landlord.")

        if not tenant.has_legal_id_document:
            raise serializers.ValidationError("A tenant must have a legal ID document before assignment.")

        if attrs.get("status") in {TenancyStatus.ACTIVE, TenancyStatus.PENDING}:
            existing_open_tenancy = Tenancy.objects.filter(
                property=property_obj,
                status__in=[TenancyStatus.PENDING, TenancyStatus.ACTIVE],
            )
            if existing_open_tenancy.exists():
                raise serializers.ValidationError("This property already has an open tenancy.")

        return attrs
