from django.contrib.auth import get_user_model
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.access import ensure_platform_admin

from .models import SecurityEvent, SecurityFlag
from .serializers import (
    SecurityEventSerializer,
    SecurityFlagCreateSerializer,
    SecurityFlagDecisionSerializer,
    SecurityFlagSerializer,
    SecurityManagedUserSerializer,
    SecurityUserActionSerializer,
)
from .services import create_security_flag, decide_security_flag, reactivate_user, suspend_user

User = get_user_model()


class SecurityEventListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SecurityEventSerializer

    def get_queryset(self):
        ensure_platform_admin(self.request)
        queryset = SecurityEvent.objects.select_related("actor")

        event_type = self.request.query_params.get("event_type")
        actor_id = self.request.query_params.get("actor")
        target_type = self.request.query_params.get("target_type")
        success_value = self.request.query_params.get("success")

        if event_type:
            queryset = queryset.filter(event_type=event_type)
        if actor_id:
            queryset = queryset.filter(actor_id=actor_id)
        if target_type:
            queryset = queryset.filter(target_type=target_type)
        if success_value is not None:
            queryset = queryset.filter(success=success_value.lower() == "true")

        return queryset


class SecurityFlagListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        ensure_platform_admin(self.request)
        queryset = SecurityFlag.objects.select_related("created_by", "resolved_by")

        status_value = self.request.query_params.get("status")
        severity = self.request.query_params.get("severity")
        target_type = self.request.query_params.get("target_type")

        if status_value:
            queryset = queryset.filter(status=status_value)
        if severity:
            queryset = queryset.filter(severity=severity)
        if target_type:
            queryset = queryset.filter(target_type=target_type)

        return queryset

    def get_serializer_class(self):
        if self.request.method == "POST":
            return SecurityFlagCreateSerializer
        return SecurityFlagSerializer

    def create(self, request, *args, **kwargs):
        admin_user = ensure_platform_admin(request)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        flag = create_security_flag(request=request, admin_user=admin_user, **serializer.validated_data)
        return Response(SecurityFlagSerializer(flag).data, status=status.HTTP_201_CREATED)


class SecurityFlagDecisionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, flag_id):
        admin_user = ensure_platform_admin(request)
        flag = get_object_or_404(SecurityFlag.objects.select_related("created_by", "resolved_by"), id=flag_id)
        serializer = SecurityFlagDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        flag = decide_security_flag(
            request=request,
            admin_user=admin_user,
            flag=flag,
            status_value=serializer.validated_data["status"],
            resolution_notes=serializer.validated_data.get("resolution_notes", ""),
        )
        return Response(SecurityFlagSerializer(flag).data, status=status.HTTP_200_OK)


class SecurityManagedUserListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SecurityManagedUserSerializer

    def get_queryset(self):
        ensure_platform_admin(self.request)
        queryset = User.objects.all().order_by("-date_joined")

        role = self.request.query_params.get("role")
        is_active = self.request.query_params.get("is_active")
        search = self.request.query_params.get("q")

        if role:
            queryset = queryset.filter(role=role)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == "true")
        if search:
            queryset = queryset.filter(Q(full_name__icontains=search) | Q(email__icontains=search))

        return queryset


class SecurityUserSuspendView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        admin_user = ensure_platform_admin(request)
        target_user = get_object_or_404(User, id=user_id)
        if target_user.id == admin_user.id:
            raise PermissionDenied("Platform admins cannot suspend themselves.")
        serializer = SecurityUserActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        suspend_user(
            request=request,
            admin_user=admin_user,
            target_user=target_user,
            reason=serializer.validated_data.get("reason", ""),
        )
        return Response(SecurityManagedUserSerializer(target_user).data, status=status.HTTP_200_OK)


class SecurityUserReactivateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, user_id):
        admin_user = ensure_platform_admin(request)
        target_user = get_object_or_404(User, id=user_id)
        serializer = SecurityUserActionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reactivate_user(
            request=request,
            admin_user=admin_user,
            target_user=target_user,
            reason=serializer.validated_data.get("reason", ""),
        )
        return Response(SecurityManagedUserSerializer(target_user).data, status=status.HTTP_200_OK)
