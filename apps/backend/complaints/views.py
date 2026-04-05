from rest_framework import generics, permissions

from .models import Complaint
from .serializers import ComplaintCreateSerializer, ComplaintSerializer


class ComplaintListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Complaint.objects.select_related(
            "tenancy__property",
            "tenancy__tenant__user",
            "tenancy__landlord__user",
            "created_by",
            "assigned_to",
        )

        tenancy_id = self.request.query_params.get("tenancy")
        status = self.request.query_params.get("status")
        direction = self.request.query_params.get("direction")

        if tenancy_id:
            queryset = queryset.filter(tenancy_id=tenancy_id)
        if status:
            queryset = queryset.filter(status=status)
        if direction:
            queryset = queryset.filter(direction=direction)

        return queryset

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ComplaintCreateSerializer
        return ComplaintSerializer
