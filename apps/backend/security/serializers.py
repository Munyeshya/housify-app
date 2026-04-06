from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import SecurityEvent, SecurityFlag, SecurityFlagStatus

User = get_user_model()


class SecurityEventSerializer(serializers.ModelSerializer):
    actor_name = serializers.CharField(source="actor.full_name", read_only=True)

    class Meta:
        model = SecurityEvent
        fields = (
            "id",
            "actor",
            "actor_name",
            "event_type",
            "success",
            "target_type",
            "target_id",
            "ip_address",
            "user_agent",
            "metadata",
            "created_at",
        )


class SecurityFlagSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source="created_by.full_name", read_only=True)
    resolved_by_name = serializers.CharField(source="resolved_by.full_name", read_only=True)

    class Meta:
        model = SecurityFlag
        fields = (
            "id",
            "created_by",
            "created_by_name",
            "resolved_by",
            "resolved_by_name",
            "target_type",
            "target_id",
            "severity",
            "status",
            "reason",
            "resolution_notes",
            "created_at",
            "updated_at",
            "resolved_at",
        )
        read_only_fields = (
            "created_by",
            "resolved_by",
            "created_at",
            "updated_at",
            "resolved_at",
        )


class SecurityFlagCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityFlag
        fields = (
            "target_type",
            "target_id",
            "severity",
            "reason",
        )


class SecurityFlagDecisionSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[
            SecurityFlagStatus.UNDER_REVIEW,
            SecurityFlagStatus.RESOLVED,
            SecurityFlagStatus.DISMISSED,
        ]
    )
    resolution_notes = serializers.CharField(required=False, allow_blank=True)


class SecurityManagedUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "full_name",
            "phone_number",
            "role",
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
            "last_login",
        )


class SecurityUserActionSerializer(serializers.Serializer):
    reason = serializers.CharField(required=False, allow_blank=True)
