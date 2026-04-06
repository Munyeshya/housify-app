from rest_framework import generics, permissions, status
from rest_framework.response import Response

from accounts.access import get_authenticated_landlord
from tenancies.models import Tenancy

from .models import TenantHistoryLookup
from .serializers import (
    TenantHistoryLookupCreateSerializer,
    TenantHistoryLookupSerializer,
    TenantHistorySummarySerializer,
)


class TenantHistoryLookupListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TenantHistoryLookupSerializer

    def get_queryset(self):
        landlord = get_authenticated_landlord(self.request)
        queryset = TenantHistoryLookup.objects.select_related(
            "landlord__user",
            "tenant__user",
        )
        tenant_id = self.request.query_params.get("tenant")

        queryset = queryset.filter(landlord=landlord)
        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)

        return queryset


class TenantHistoryLookupCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = TenantHistoryLookupCreateSerializer

    def create(self, request, *args, **kwargs):
        landlord = get_authenticated_landlord(request)
        payload = request.data.copy()
        payload["landlord"] = landlord.id
        serializer = self.get_serializer(data=payload)
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
