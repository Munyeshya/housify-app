from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response

from accounts.access import (
    get_active_agent_property_ids,
    get_authenticated_agent,
    get_authenticated_landlord,
    get_authenticated_tenant,
    is_admin_user,
)
from .models import Tenancy
from .serializers import TenancyCreateSerializer, TenancySerializer


class TenancyListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    queryset = Tenancy.objects.select_related("property", "tenant__user", "landlord__user").prefetch_related(
        "payments"
    )

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user

        if is_admin_user(user):
            return queryset
        if user.role == "landlord":
            return queryset.filter(landlord=get_authenticated_landlord(self.request))
        if user.role == "tenant":
            return queryset.filter(tenant=get_authenticated_tenant(self.request))
        if user.role == "agent":
            return queryset.filter(property_id__in=get_active_agent_property_ids(get_authenticated_agent(self.request)))

        return queryset.none()

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TenancyCreateSerializer
        return TenancySerializer

    def create(self, request, *args, **kwargs):
        if request.user.role != "landlord":
            raise PermissionDenied("Only authenticated landlords can create tenancy records.")

        landlord = get_authenticated_landlord(request)
        serializer = self.get_serializer(
            data=request.data,
            context={**self.get_serializer_context(), "landlord": landlord},
        )
        serializer.is_valid(raise_exception=True)
        tenancy = serializer.save(landlord=landlord, assigned_by=request.user)
        response_serializer = TenancySerializer(tenancy)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
