from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.access import (
    ensure_platform_admin,
    get_authenticated_agent,
    get_authenticated_landlord,
    get_authenticated_tenant,
)

from .models import LandlordDocumentVerificationAccess, TenantLegalDocument
from .serializers import (
    LandlordDocumentVerificationAccessSerializer,
    LandlordDocumentVerificationAccessUpdateSerializer,
    TenantLegalDocumentAccessSerializer,
    TenantLegalDocumentSerializer,
    TenantDocumentVerificationRequestSerializer,
    TenantDocumentVerificationResultSerializer,
    TenantLegalDocumentUpsertSerializer,
)
from .services import get_document_verification_gateway
from security.models import SecurityEventType
from security.services import log_security_event


class TenantLegalDocumentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        tenant = get_authenticated_tenant(self.request)
        queryset = TenantLegalDocument.objects.select_related("tenant__user")
        return queryset.filter(tenant=tenant)

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TenantLegalDocumentUpsertSerializer
        return TenantLegalDocumentSerializer

    def create(self, request, *args, **kwargs):
        tenant = get_authenticated_tenant(request)
        payload = request.data.copy()
        payload["tenant"] = tenant.id
        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        document = serializer.save()
        response_serializer = TenantLegalDocumentSerializer(document)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class TenantLegalDocumentDestroyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, document_id):
        tenant = get_authenticated_tenant(request)
        document = get_object_or_404(TenantLegalDocument, id=document_id, tenant=tenant)
        document.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TenantLegalDocumentAccessView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        payload = request.query_params.copy()
        if TenantLegalDocument.can_admin_view(request.user):
            payload.pop("landlord", None)
            payload.pop("agent", None)
        elif request.user.role == "landlord":
            landlord = get_authenticated_landlord(request)
            payload["landlord"] = landlord.id
            payload.pop("agent", None)
        elif request.user.role == "agent":
            agent = get_authenticated_agent(request)
            payload["agent"] = agent.id
            payload.pop("landlord", None)
        else:
            return Response(
                {"detail": "Only landlords and agents can request legal document access."},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = TenantLegalDocumentAccessSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        document = serializer.validated_data["document"]
        log_security_event(
            request=request,
            actor=request.user,
            event_type=SecurityEventType.LEGAL_DOCUMENT_ACCESS,
            success=True,
            target_type="tenant_legal_document",
            target_id=document.id,
            metadata={
                "tenant_id": document.tenant_id,
                "viewer_role": request.user.role,
            },
        )
        return Response(TenantLegalDocumentSerializer(document).data, status=status.HTTP_200_OK)


class PlatformDocumentVerificationAccessView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        ensure_platform_admin(request)
        queryset = LandlordDocumentVerificationAccess.objects.select_related("landlord__user", "granted_by")
        serializer = LandlordDocumentVerificationAccessSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        admin_user = ensure_platform_admin(request)
        serializer = LandlordDocumentVerificationAccessUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        landlord = serializer.validated_data["landlord"]
        access, _ = LandlordDocumentVerificationAccess.objects.update_or_create(
            landlord=landlord,
            defaults={
                "is_enabled": serializer.validated_data["is_enabled"],
                "provider_code": serializer.validated_data.get("provider_code", "national-registry"),
                "notes": serializer.validated_data.get("notes", ""),
                "granted_by": admin_user,
                "granted_at": timezone.now(),
            },
        )
        log_security_event(
            request=request,
            actor=admin_user,
            event_type=SecurityEventType.LANDLORD_VERIFICATION_ACCESS_CHANGED,
            success=True,
            target_type="landlord",
            target_id=landlord.id,
            metadata={
                "is_enabled": access.is_enabled,
                "provider_code": access.provider_code,
            },
        )
        response_serializer = LandlordDocumentVerificationAccessSerializer(access)
        return Response(response_serializer.data, status=status.HTTP_200_OK)


class LandlordDocumentVerificationAccessStatusView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        landlord = get_authenticated_landlord(request)
        access, _ = LandlordDocumentVerificationAccess.objects.get_or_create(landlord=landlord)
        serializer = LandlordDocumentVerificationAccessSerializer(access)
        return Response(serializer.data, status=status.HTTP_200_OK)


class TenantLegalDocumentVerificationView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        landlord = get_authenticated_landlord(request)
        access = LandlordDocumentVerificationAccess.objects.filter(
            landlord=landlord,
            is_enabled=True,
        ).first()
        if not access:
            return Response(
                {
                    "detail": (
                        "External tenant document verification is not enabled for this landlord. "
                        "A platform admin must grant access first."
                    )
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = TenantDocumentVerificationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        document = serializer.validated_data["document"]
        gateway = get_document_verification_gateway()
        result = gateway.verify_tenant_document(document=document, landlord=landlord)
        log_security_event(
            request=request,
            actor=request.user,
            event_type=SecurityEventType.LANDLORD_DOCUMENT_VERIFICATION_REQUESTED,
            success=result.is_available,
            target_type="tenant_legal_document",
            target_id=document.id,
            metadata={
                "tenant_id": document.tenant_id,
                "provider_code": result.provider_code,
                "is_available": result.is_available,
            },
        )
        response_serializer = TenantDocumentVerificationResultSerializer(result)
        return Response(response_serializer.data, status=status.HTTP_200_OK)
