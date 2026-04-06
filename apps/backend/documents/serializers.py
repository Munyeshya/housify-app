from rest_framework import serializers

from accounts.models import AgentProfile, LandlordProfile, TenantProfile

from .models import TenantLegalDocument


class TenantLegalDocumentSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source="tenant.user.full_name", read_only=True)
    tenant_identifier = serializers.UUIDField(source="tenant.tenant_identifier", read_only=True)

    class Meta:
        model = TenantLegalDocument
        fields = (
            "id",
            "tenant",
            "tenant_name",
            "tenant_identifier",
            "document_type",
            "document_number",
            "document_url",
            "issuing_country",
            "status",
            "expires_on",
            "notes",
            "uploaded_at",
            "updated_at",
        )


class TenantLegalDocumentUpsertSerializer(serializers.ModelSerializer):
    tenant = serializers.PrimaryKeyRelatedField(queryset=TenantProfile.objects.select_related("user"))

    class Meta:
        model = TenantLegalDocument
        fields = (
            "tenant",
            "document_type",
            "document_number",
            "document_url",
            "issuing_country",
            "status",
            "expires_on",
            "notes",
        )

    def create(self, validated_data):
        tenant = validated_data["tenant"]
        instance, _ = TenantLegalDocument.objects.update_or_create(
            tenant=tenant,
            defaults={
                "document_type": validated_data["document_type"],
                "document_number": validated_data["document_number"],
                "document_url": validated_data["document_url"],
                "issuing_country": validated_data.get("issuing_country", "Rwanda"),
                "status": validated_data.get("status"),
                "expires_on": validated_data.get("expires_on"),
                "notes": validated_data.get("notes", ""),
            },
        )
        return instance


class TenantLegalDocumentAccessSerializer(serializers.Serializer):
    tenant = serializers.PrimaryKeyRelatedField(queryset=TenantProfile.objects.select_related("user"))
    landlord = serializers.PrimaryKeyRelatedField(
        queryset=LandlordProfile.objects.select_related("user"),
        required=False,
        allow_null=True,
    )
    agent = serializers.PrimaryKeyRelatedField(
        queryset=AgentProfile.objects.select_related("user", "created_by_landlord"),
        required=False,
        allow_null=True,
    )

    def validate(self, attrs):
        landlord = attrs.get("landlord")
        agent = attrs.get("agent")
        tenant = attrs["tenant"]

        if bool(landlord) == bool(agent):
            raise serializers.ValidationError("Provide either a landlord or an agent to request document access.")

        if landlord and not TenantLegalDocument.can_landlord_view(landlord, tenant):
            raise serializers.ValidationError(
                "A landlord can only view the legal document of a tenant currently occupying their property."
            )

        if agent and not TenantLegalDocument.can_agent_view(agent, tenant):
            raise serializers.ValidationError(
                "Only private agents managing a tenant's currently occupied property can view the legal document."
            )

        try:
            attrs["document"] = tenant.legal_document
        except TenantLegalDocument.DoesNotExist as exc:
            raise serializers.ValidationError("The tenant does not have a legal document on file.") from exc

        return attrs
