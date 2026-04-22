from django.contrib.auth import get_user_model
from rest_framework import serializers

from accounts.models import AgentProfile, AgentType, LandlordProfile, UserRole
from complaints.models import Complaint
from payments.models import Payment
from properties.models import Property
from tenancies.models import Tenancy, TenancyStatus

from .models import AgentAssignmentStatus, PropertyAgentAssignment

User = get_user_model()


class AgentIdentitySerializer(serializers.ModelSerializer):
    profile_id = serializers.IntegerField(source="id", read_only=True)
    id = serializers.IntegerField(source="user.id", read_only=True)
    full_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.CharField(source="user.email", read_only=True)
    phone_number = serializers.CharField(source="user.phone_number", read_only=True)
    type = serializers.CharField(source="agent_type", read_only=True)

    class Meta:
        model = AgentProfile
        fields = ("profile_id", "id", "full_name", "email", "phone_number", "type", "bio")


class PrivateAgentCreateSerializer(serializers.ModelSerializer):
    landlord = serializers.PrimaryKeyRelatedField(queryset=LandlordProfile.objects.select_related("user"))
    email = serializers.EmailField()
    full_name = serializers.CharField(max_length=255)
    phone_number = serializers.CharField(max_length=30, allow_blank=True, required=False)
    password = serializers.CharField(write_only=True, min_length=8)
    bio = serializers.CharField(allow_blank=True, required=False)

    class Meta:
        model = AgentProfile
        fields = ("landlord", "email", "full_name", "phone_number", "password", "bio")

    def create(self, validated_data):
        landlord = validated_data.pop("landlord")
        password = validated_data.pop("password")
        user = User.objects.create_user(
            email=validated_data.pop("email"),
            password=password,
            role=UserRole.AGENT,
            full_name=validated_data.pop("full_name"),
            phone_number=validated_data.pop("phone_number", ""),
        )
        return AgentProfile.objects.create(
            user=user,
            agent_type=AgentType.PRIVATE,
            created_by_landlord=landlord,
            bio=validated_data.pop("bio", ""),
        )


class PropertyAgentAssignmentSerializer(serializers.ModelSerializer):
    agent = AgentIdentitySerializer(read_only=True)
    property_title = serializers.CharField(source="property.title", read_only=True)
    landlord_name = serializers.CharField(source="landlord.display_name", read_only=True)
    can_view_payments = serializers.BooleanField(read_only=True)
    can_view_complaints = serializers.BooleanField(read_only=True)
    can_view_occupancy = serializers.BooleanField(read_only=True)
    can_view_legal_id = serializers.BooleanField(read_only=True)

    class Meta:
        model = PropertyAgentAssignment
        fields = (
            "id",
            "agent",
            "property",
            "property_title",
            "landlord",
            "landlord_name",
            "status",
            "granted_by",
            "granted_at",
            "revoked_at",
            "can_view_payments",
            "can_view_complaints",
            "can_view_occupancy",
            "can_view_legal_id",
        )


class PropertyAgentAssignmentCreateSerializer(serializers.ModelSerializer):
    landlord = serializers.PrimaryKeyRelatedField(queryset=LandlordProfile.objects.select_related("user"))
    agent = serializers.PrimaryKeyRelatedField(queryset=AgentProfile.objects.select_related("user", "created_by_landlord"))
    property = serializers.PrimaryKeyRelatedField(queryset=Property.objects.select_related("landlord"))

    class Meta:
        model = PropertyAgentAssignment
        fields = ("landlord", "agent", "property", "status", "granted_by")

    def validate(self, attrs):
        landlord = attrs["landlord"]
        agent = attrs["agent"]
        property_obj = attrs["property"]

        if property_obj.landlord_id != landlord.id:
            raise serializers.ValidationError("A landlord may only assign agents to properties they own.")

        if agent.agent_type == AgentType.PUBLIC and agent.created_by_landlord_id is not None:
            raise serializers.ValidationError("Public agents must not be landlord-owned private agent records.")

        if agent.agent_type == AgentType.PRIVATE and agent.created_by_landlord_id != landlord.id:
            raise serializers.ValidationError("Private agents must belong to the landlord who created them.")

        if PropertyAgentAssignment.objects.filter(
            agent=agent,
            property=property_obj,
            status=AgentAssignmentStatus.ACTIVE,
        ).exists():
            raise serializers.ValidationError("This agent already has active access to the property.")

        return attrs


class ManagedTenantSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source="tenant.user.full_name", read_only=True)
    tenant_identifier = serializers.CharField(source="tenant.tenant_identifier", read_only=True)
    legal_id_type = serializers.SerializerMethodField()
    legal_id_number = serializers.SerializerMethodField()
    legal_id_document_url = serializers.SerializerMethodField()

    class Meta:
        model = Tenancy
        fields = (
            "id",
            "tenant_name",
            "tenant_identifier",
            "status",
            "start_date",
            "end_date",
            "move_out_date",
            "legal_id_type",
            "legal_id_number",
            "legal_id_document_url",
        )

    def _can_view_legal_id(self):
        assignment = self.context.get("assignment")
        return bool(assignment and assignment.can_view_legal_id)

    def get_legal_id_type(self, obj):
        if self._can_view_legal_id():
            return obj.tenant.legal_id_type
        return None

    def get_legal_id_number(self, obj):
        if self._can_view_legal_id():
            return obj.tenant.legal_id_number
        return None

    def get_legal_id_document_url(self, obj):
        if self._can_view_legal_id():
            return obj.tenant.legal_id_document_url
        return None


class ManagedPropertySerializer(serializers.ModelSerializer):
    active_tenancies = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = (
            "id",
            "property_reference",
            "title",
            "property_type",
            "status",
            "is_public",
            "city",
            "neighborhood",
            "rent_amount",
            "currency",
            "active_tenancies",
        )

    def get_active_tenancies(self, obj):
        assignment = self.context.get("assignment")
        active_tenancies = obj.tenancies.filter(status=TenancyStatus.ACTIVE)
        return ManagedTenantSerializer(active_tenancies, many=True, context={"assignment": assignment}).data


class AgentManagedPaymentSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="tenancy.property.title", read_only=True)

    class Meta:
        model = Payment
        fields = (
            "id",
            "category",
            "status",
            "method",
            "amount_due",
            "amount_paid",
            "currency",
            "due_date",
            "paid_at",
            "property_title",
            "reference",
        )


class AgentManagedComplaintSerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="tenancy.property.title", read_only=True)

    class Meta:
        model = Complaint
        fields = (
            "id",
            "title",
            "category",
            "direction",
            "status",
            "property_title",
            "opened_at",
            "resolved_at",
        )
