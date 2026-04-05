from rest_framework import generics, permissions

from .models import Payment
from .serializers import PaymentCreateSerializer, PaymentSerializer


class PaymentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = Payment.objects.select_related(
            "tenancy__property",
            "tenancy__tenant__user",
            "tenancy__landlord__user",
        )

        tenancy_id = self.request.query_params.get("tenancy")
        tenant_id = self.request.query_params.get("tenant")
        landlord_id = self.request.query_params.get("landlord")
        status = self.request.query_params.get("status")

        if tenancy_id:
            queryset = queryset.filter(tenancy_id=tenancy_id)
        if tenant_id:
            queryset = queryset.filter(tenancy__tenant_id=tenant_id)
        if landlord_id:
            queryset = queryset.filter(tenancy__landlord_id=landlord_id)
        if status:
            queryset = queryset.filter(status=status)

        return queryset

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PaymentCreateSerializer
        return PaymentSerializer
