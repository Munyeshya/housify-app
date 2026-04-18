from rest_framework import serializers

from accounts.models import AgentProfile, LandlordProfile, TenantProfile

from .models import (
    LandlordDocumentVerificationAccess,
    LegalDocumentStatus,
    LegalDocumentType,
    TenantLegalDocument,
)


class TenantLegalDocumentSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source="tenant.user.full_name", read_only=True)
    tenant_identifier = serializers.CharField(source="tenant.tenant_identifier", read_only=True)
    document_url = serializers.SerializerMethodField()
    document_name = serializers.SerializerMethodField()
    has_uploaded_file = serializers.SerializerMethodField()

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
            "document_name",
            "has_uploaded_file",
            "issuing_country",
            "status",
            "expires_on",
            "notes",
            "uploaded_at",
            "updated_at",
        )

    def get_document_url(self, obj):
        reference = obj.document_reference
        request = self.context.get("request")
        if request and reference and reference.startswith("/"):
            return request.build_absolute_uri(reference)
        return reference

    def get_document_name(self, obj):
        if obj.document_file:
            return obj.document_file.name.rsplit("/", 1)[-1]
        if obj.document_url:
            return obj.document_url.rsplit("/", 1)[-1]
        return ""

    def get_has_uploaded_file(self, obj):
        return bool(obj.document_file)


class TenantLegalDocumentUpsertSerializer(serializers.ModelSerializer):
    tenant = serializers.PrimaryKeyRelatedField(queryset=TenantProfile.objects.select_related("user"))
    document_type = serializers.ChoiceField(choices=LegalDocumentType.choices)
    document_file = serializers.FileField(required=False, allow_null=True)
    document_url = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = TenantLegalDocument
        fields = (
            "tenant",
            "document_type",
            "document_number",
            "document_url",
            "document_file",
            "issuing_country",
            "status",
            "expires_on",
            "notes",
        )

    def validate(self, attrs):
        tenant = attrs["tenant"]
        existing_document = TenantLegalDocument.objects.filter(tenant=tenant).first()
        has_document_url = bool(attrs.get("document_url"))
        has_document_file = bool(attrs.get("document_file"))

        if has_document_url and has_document_file:
            raise serializers.ValidationError("Provide either a document URL or a document file, not both.")

        if not has_document_url and not has_document_file and not existing_document:
            raise serializers.ValidationError("Provide a document URL or upload a document file.")

        return attrs

    def create(self, validated_data):
        tenant = validated_data["tenant"]
        existing_document = TenantLegalDocument.objects.filter(tenant=tenant).first()
        incoming_file = validated_data.get("document_file")
        incoming_url = validated_data.get("document_url")

        if existing_document and incoming_file and existing_document.document_file:
            existing_document.document_file.delete(save=False)
        if existing_document and incoming_url and existing_document.document_file:
            existing_document.document_file.delete(save=False)

        defaults = {
            "document_type": validated_data["document_type"],
            "document_number": validated_data["document_number"],
            "document_url": (
                incoming_url
                if incoming_url is not None
                else (existing_document.document_url if existing_document else "")
            ),
            "document_file": (
                incoming_file
                if incoming_file is not None
                else (existing_document.document_file if existing_document else None)
            ),
            "issuing_country": validated_data.get(
                "issuing_country",
                existing_document.issuing_country if existing_document else "Rwanda",
            ),
            "status": validated_data.get(
                "status",
                existing_document.status if existing_document else LegalDocumentStatus.SUBMITTED,
            ),
            "expires_on": validated_data.get(
                "expires_on",
                existing_document.expires_on if existing_document else None,
            ),
            "notes": validated_data.get(
                "notes",
                existing_document.notes if existing_document else "",
            ),
        }

        if incoming_file is not None:
            defaults["document_url"] = ""
        elif incoming_url is not None:
            defaults["document_file"] = None

        instance, _ = TenantLegalDocument.objects.update_or_create(tenant=tenant, defaults=defaults)
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


class LandlordDocumentVerificationAccessSerializer(serializers.ModelSerializer):
    landlord_name = serializers.CharField(source="landlord.display_name", read_only=True)
    granted_by_name = serializers.CharField(source="granted_by.full_name", read_only=True)

    class Meta:
        model = LandlordDocumentVerificationAccess
        fields = (
            "id",
            "landlord",
            "landlord_name",
            "is_enabled",
            "provider_code",
            "notes",
            "granted_by",
            "granted_by_name",
            "granted_at",
            "updated_at",
        )
        read_only_fields = ("granted_by", "granted_at", "updated_at")


class LandlordDocumentVerificationAccessUpdateSerializer(serializers.ModelSerializer):
    landlord = serializers.PrimaryKeyRelatedField(queryset=LandlordProfile.objects.select_related("user"))

    class Meta:
        model = LandlordDocumentVerificationAccess
        fields = ("landlord", "is_enabled", "provider_code", "notes")


class TenantDocumentVerificationRequestSerializer(serializers.Serializer):
    tenant = serializers.PrimaryKeyRelatedField(queryset=TenantProfile.objects.select_related("user"))

    def validate(self, attrs):
        tenant = attrs["tenant"]
        try:
            attrs["document"] = tenant.legal_document
        except TenantLegalDocument.DoesNotExist as exc:
            raise serializers.ValidationError("The tenant does not have a legal document on file.") from exc
        return attrs


class TenantDocumentVerificationResultSerializer(serializers.Serializer):
    is_available = serializers.BooleanField()
    is_valid = serializers.BooleanField(allow_null=True)
    provider_code = serializers.CharField()
    message = serializers.CharField()
    raw_payload = serializers.JSONField(allow_null=True)
