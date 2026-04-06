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
from security.models import SecurityEventType
from security.services import log_security_event
from .models import Payment
from .serializers import PaymentCreateSerializer, PaymentSerializer


class PaymentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Payment.objects.select_related(
            "tenancy__property",
            "tenancy__tenant__user",
            "tenancy__landlord__user",
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

        if tenancy_id:
            scoped_queryset = scoped_queryset.filter(tenancy_id=tenancy_id)
        if status_value:
            scoped_queryset = scoped_queryset.filter(status=status_value)

        return scoped_queryset

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PaymentCreateSerializer
        return PaymentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tenancy = serializer.validated_data["tenancy"]

        if request.user.role == "landlord":
            landlord = get_authenticated_landlord(request)
            if tenancy.landlord_id != landlord.id:
                raise PermissionDenied("Landlords may only record payments for their own tenancies.")
        elif request.user.role == "tenant":
            tenant = get_authenticated_tenant(request)
            if tenancy.tenant_id != tenant.id:
                raise PermissionDenied("Tenants may only record payments for their own tenancies.")
        else:
            raise PermissionDenied("Only authenticated landlords or tenants can record payments.")

        payment = serializer.save()
        log_security_event(
            request=request,
            actor=request.user,
            event_type=SecurityEventType.PAYMENT_CREATED,
            success=True,
            target_type="payment",
            target_id=payment.id,
            metadata={
                "tenancy_id": payment.tenancy_id,
                "category": payment.category,
                "status": payment.status,
                "amount_due": str(payment.amount_due),
                "amount_paid": str(payment.amount_paid),
            },
        )
        response_serializer = PaymentSerializer(payment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
