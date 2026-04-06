from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.access import get_authenticated_agent, get_authenticated_landlord, get_authenticated_tenant

from .models import TenantLegalDocument
from .serializers import (
    TenantLegalDocumentAccessSerializer,
    TenantLegalDocumentSerializer,
    TenantLegalDocumentUpsertSerializer,
)


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
        if request.user.role == "landlord":
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
        return Response(TenantLegalDocumentSerializer(document).data, status=status.HTTP_200_OK)
