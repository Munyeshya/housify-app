from rest_framework import serializers

from tenancies.models import Tenancy

from .models import Complaint


class ComplaintSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="tenancy.property.title", read_only=True)
    tenant_name = serializers.CharField(source="tenancy.tenant.user.full_name", read_only=True)
    landlord_name = serializers.CharField(source="tenancy.landlord.display_name", read_only=True)
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)
    assigned_to_name = serializers.CharField(source="assigned_to.full_name", read_only=True)

    class Meta:
        model = Complaint
        fields = (
            "id",
            "tenancy",
            "property_title",
            "tenant_name",
            "landlord_name",
            "title",
            "description",
            "category",
            "direction",
            "status",
            "created_by",
            "created_by_name",
            "assigned_to",
            "assigned_to_name",
            "resolution_notes",
            "opened_at",
            "resolved_at",
            "updated_at",
        )


class ComplaintCreateSerializer(serializers.ModelSerializer):
    tenancy = serializers.PrimaryKeyRelatedField(queryset=Tenancy.objects.select_related("property", "tenant__user"))

    class Meta:
        model = Complaint
        fields = (
            "tenancy",
            "title",
            "description",
            "category",
        )
