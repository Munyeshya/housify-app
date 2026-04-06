from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import TenantLegalDocument
from .serializers import (
    TenantLegalDocumentAccessSerializer,
    TenantLegalDocumentSerializer,
    TenantLegalDocumentUpsertSerializer,
)


class TenantLegalDocumentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = TenantLegalDocument.objects.select_related("tenant__user")
        tenant_id = self.request.query_params.get("tenant")

        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)

        return queryset

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TenantLegalDocumentUpsertSerializer
        return TenantLegalDocumentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        document = serializer.save()
        response_serializer = TenantLegalDocumentSerializer(document)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class TenantLegalDocumentDestroyView(APIView):
    permission_classes = [permissions.AllowAny]

    def delete(self, request, document_id):
        tenant_id = request.query_params.get("tenant")
        document = get_object_or_404(TenantLegalDocument, id=document_id, tenant_id=tenant_id)
        document.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class TenantLegalDocumentAccessView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        serializer = TenantLegalDocumentAccessSerializer(data=request.query_params)
        serializer.is_valid(raise_exception=True)
        document = serializer.validated_data["document"]
        return Response(TenantLegalDocumentSerializer(document).data, status=status.HTTP_200_OK)
