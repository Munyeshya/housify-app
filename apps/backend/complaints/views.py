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
from .models import Complaint, ComplaintDirection, ComplaintStatus
from .serializers import ComplaintCreateSerializer, ComplaintSerializer


class ComplaintListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Complaint.objects.select_related(
            "tenancy__property",
            "tenancy__tenant__user",
            "tenancy__landlord__user",
            "created_by",
            "assigned_to",
        )
        user = self.request.user

        if is_admin_user(user):
            scoped_queryset = queryset
        elif user.role == "landlord":
            scoped_queryset = queryset.filter(tenancy__landlord=get_authenticated_landlord(self.request))
        elif user.role == "tenant":
            scoped_queryset = queryset.filter(tenancy__tenant=get_authenticated_tenant(self.request))
        elif user.role == "agent":
            scoped_queryset = queryset.filter(
                tenancy__property_id__in=get_active_agent_property_ids(get_authenticated_agent(self.request))
            )
        else:
            scoped_queryset = queryset.none()

        tenancy_id = self.request.query_params.get("tenancy")
        status_value = self.request.query_params.get("status")
        direction = self.request.query_params.get("direction")

        if tenancy_id:
            scoped_queryset = scoped_queryset.filter(tenancy_id=tenancy_id)
        if status_value:
            scoped_queryset = scoped_queryset.filter(status=status_value)
        if direction:
            scoped_queryset = scoped_queryset.filter(direction=direction)

        return scoped_queryset

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ComplaintCreateSerializer
        return ComplaintSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tenancy = serializer.validated_data["tenancy"]
        payload = dict(serializer.validated_data)

        if request.user.role == "landlord":
            landlord = get_authenticated_landlord(request)
            if tenancy.landlord_id != landlord.id:
                raise PermissionDenied("Landlords may only create complaints for their own tenancies.")
            payload["created_by"] = request.user
            payload["assigned_to"] = tenancy.tenant.user
            payload["direction"] = ComplaintDirection.LANDLORD_TO_TENANT
            payload["status"] = ComplaintStatus.OPEN
        elif request.user.role == "tenant":
            tenant = get_authenticated_tenant(request)
            if tenancy.tenant_id != tenant.id:
                raise PermissionDenied("Tenants may only create complaints for their own tenancies.")
            payload["created_by"] = request.user
            payload["assigned_to"] = tenancy.landlord.user
            payload["direction"] = ComplaintDirection.TENANT_TO_LANDLORD
            payload["status"] = ComplaintStatus.OPEN
        else:
            raise PermissionDenied("Only authenticated landlords or tenants can create complaints.")

        complaint = Complaint.objects.create(**payload)
        response_serializer = ComplaintSerializer(complaint)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
