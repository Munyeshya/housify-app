from rest_framework import generics, permissions, status
from rest_framework.response import Response

from tenancies.models import Tenancy

from .models import TenantHistoryLookup
from .serializers import (
    TenantHistoryLookupCreateSerializer,
    TenantHistoryLookupSerializer,
    TenantHistorySummarySerializer,
)


class TenantHistoryLookupListView(generics.ListAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = TenantHistoryLookupSerializer

    def get_queryset(self):
        queryset = TenantHistoryLookup.objects.select_related(
            "landlord__user",
            "tenant__user",
        )
        landlord_id = self.request.query_params.get("landlord")
        tenant_id = self.request.query_params.get("tenant")

        if landlord_id:
            queryset = queryset.filter(landlord_id=landlord_id)
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)

        return queryset


class TenantHistoryLookupCreateView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = TenantHistoryLookupCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        lookup = serializer.save()

        tenancies = list(
            Tenancy.objects.select_related(
                "property",
                "landlord__user",
                "tenant__user",
            ).prefetch_related("payments", "complaints").filter(
                tenant=lookup.tenant,
            )
        )

        summary = TenantHistorySummarySerializer(
            TenantHistorySummarySerializer.build(lookup.tenant, tenancies)
        )
        return Response(
            {
                "lookup": TenantHistoryLookupSerializer(lookup).data,
                "summary": summary.data,
            },
            status=status.HTTP_201_CREATED,
        )
