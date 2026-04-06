from rest_framework import serializers

from documents.models import TenantLegalDocument

from .models import AgentProfile, AgentType, LandlordProfile, TenantProfile, User, UserRole


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "full_name", "phone_number", "role")


class LandlordRegistrationSerializer(serializers.ModelSerializer):
    display_name = serializers.CharField(max_length=255)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ("email", "full_name", "phone_number", "password", "display_name")

    def create(self, validated_data):
        display_name = validated_data.pop("display_name")
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, role=UserRole.LANDLORD, **validated_data)
        LandlordProfile.objects.create(user=user, display_name=display_name)
        return user


class TenantRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    legal_id_type = serializers.CharField(max_length=100, allow_blank=True, required=False)
    legal_id_number = serializers.CharField(max_length=100, allow_blank=True, required=False)
    legal_id_document_url = serializers.URLField(allow_blank=True, required=False)

    class Meta:
        model = User
        fields = (
            "email",
            "full_name",
            "phone_number",
            "password",
            "legal_id_type",
            "legal_id_number",
            "legal_id_document_url",
        )

    def create(self, validated_data):
        tenant_profile_data = {
            "legal_id_type": validated_data.pop("legal_id_type", ""),
            "legal_id_number": validated_data.pop("legal_id_number", ""),
            "legal_id_document_url": validated_data.pop("legal_id_document_url", ""),
        }
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, role=UserRole.TENANT, **validated_data)
        tenant = TenantProfile.objects.create(user=user, **tenant_profile_data)
        if tenant_profile_data["legal_id_document_url"]:
            TenantLegalDocument.objects.create(
                tenant=tenant,
                document_type=tenant_profile_data["legal_id_type"] or "National ID",
                document_number=tenant_profile_data["legal_id_number"],
                document_url=tenant_profile_data["legal_id_document_url"],
            )
        return user


class AgentRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    agent_type = serializers.ChoiceField(choices=AgentType.choices, default=AgentType.PUBLIC)
    bio = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model = User
        fields = ("email", "full_name", "phone_number", "password", "agent_type", "bio")

    def create(self, validated_data):
        agent_type = validated_data.pop("agent_type", AgentType.PUBLIC)
        bio = validated_data.pop("bio", "")
        password = validated_data.pop("password")
        user = User.objects.create_user(password=password, role=UserRole.AGENT, **validated_data)
        AgentProfile.objects.create(user=user, agent_type=agent_type, bio=bio)
        return user
