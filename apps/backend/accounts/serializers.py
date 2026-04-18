from django.contrib.auth import authenticate
from rest_framework import serializers

from documents.models import LegalDocumentType, TenantLegalDocument

from .models import AgentProfile, AgentType, LandlordProfile, TenantProfile, User, UserRole


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "email", "full_name", "phone_number", "role", "is_staff", "is_superuser")


class UserProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("full_name", "phone_number")


class LandlordProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = LandlordProfile
        fields = ("id", "display_name", "user")


class LandlordProfileUpdateSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", required=False)
    phone_number = serializers.CharField(source="user.phone_number", required=False, allow_blank=True)

    class Meta:
        model = LandlordProfile
        fields = ("display_name", "full_name", "phone_number")

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if user_data:
            for attr, value in user_data.items():
                setattr(instance.user, attr, value)
            instance.user.save(update_fields=list(user_data.keys()))

        return instance


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
    legal_id_type = serializers.ChoiceField(choices=LegalDocumentType.choices, allow_blank=True, required=False)
    legal_id_number = serializers.CharField(max_length=100, allow_blank=True, required=False)
    legal_id_document_url = serializers.CharField(allow_blank=True, required=False)

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


class TenantProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    has_legal_id_document = serializers.BooleanField(read_only=True)

    class Meta:
        model = TenantProfile
        fields = (
            "id",
            "tenant_identifier",
            "legal_id_type",
            "legal_id_number",
            "legal_id_document_url",
            "has_legal_id_document",
            "user",
        )


class TenantProfileUpdateSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", required=False)
    phone_number = serializers.CharField(source="user.phone_number", required=False, allow_blank=True)

    class Meta:
        model = TenantProfile
        fields = ("full_name", "phone_number")

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        if user_data:
            for attr, value in user_data.items():
                setattr(instance.user, attr, value)
            instance.user.save(update_fields=list(user_data.keys()))
        return instance


class AgentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    created_by_landlord = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = AgentProfile
        fields = ("id", "agent_type", "bio", "created_by_landlord", "user")


class AgentProfileUpdateSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(source="user.full_name", required=False)
    phone_number = serializers.CharField(source="user.phone_number", required=False, allow_blank=True)

    class Meta:
        model = AgentProfile
        fields = ("bio", "full_name", "phone_number")

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if user_data:
            for attr, value in user_data.items():
                setattr(instance.user, attr, value)
            instance.user.save(update_fields=list(user_data.keys()))

        return instance


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")
        user = authenticate(
            request=self.context.get("request"),
            username=email,
            password=password,
        )
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("This account is inactive.")
        attrs["user"] = user
        return attrs
