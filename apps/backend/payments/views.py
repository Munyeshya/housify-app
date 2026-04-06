from decimal import Decimal

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.access import (
    get_active_agent_property_ids,
    get_authenticated_agent,
    get_authenticated_landlord,
    get_authenticated_tenant,
    is_admin_user,
)
from security.models import SecurityEventType
from security.services import log_security_event
from .models import Payment, PaymentAdjustment, PaymentAdjustmentStatus, PaymentStatus, PaymentVerificationStatus
from .serializers import (
    PaymentAdjustmentCreateSerializer,
    PaymentAdjustmentDecisionSerializer,
    PaymentAdjustmentSerializer,
    PaymentCreateSerializer,
    PaymentIntegritySummarySerializer,
    PaymentSerializer,
)


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


class PaymentAdjustmentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = PaymentAdjustment.objects.select_related(
            "payment__tenancy__property",
            "payment__tenancy__tenant__user",
            "payment__tenancy__landlord__user",
            "created_by",
            "approved_by",
        )
        user = self.request.user

        if is_admin_user(user):
            scoped_queryset = queryset
        elif user.role == "landlord":
            scoped_queryset = queryset.filter(payment__tenancy__landlord=get_authenticated_landlord(self.request))
        elif user.role == "tenant":
            scoped_queryset = queryset.filter(payment__tenancy__tenant=get_authenticated_tenant(self.request))
        elif user.role == "agent":
            scoped_queryset = queryset.filter(
                payment__tenancy__property_id__in=get_active_agent_property_ids(get_authenticated_agent(self.request))
            )
        else:
            scoped_queryset = queryset.none()

        payment_id = self.request.query_params.get("payment")
        if payment_id:
            scoped_queryset = scoped_queryset.filter(payment_id=payment_id)

        return scoped_queryset

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PaymentAdjustmentCreateSerializer
        return PaymentAdjustmentSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        payment = serializer.validated_data["payment"]

        if request.user.role == "landlord":
            landlord = get_authenticated_landlord(request)
            if payment.tenancy.landlord_id != landlord.id:
                raise PermissionDenied("Landlords may only request adjustments for their own tenancies.")
        elif request.user.role == "tenant":
            tenant = get_authenticated_tenant(request)
            if payment.tenancy.tenant_id != tenant.id:
                raise PermissionDenied("Tenants may only request adjustments for their own payments.")
        elif not is_admin_user(request.user):
            raise PermissionDenied("Only authenticated landlords, tenants, or admins can request payment adjustments.")

        adjustment = serializer.save(created_by=request.user)
        log_security_event(
            request=request,
            actor=request.user,
            event_type=SecurityEventType.PAYMENT_ADJUSTMENT_CREATED,
            success=True,
            target_type="payment_adjustment",
            target_id=adjustment.id,
            metadata={
                "payment_id": payment.id,
                "adjustment_type": adjustment.adjustment_type,
                "amount_delta": str(adjustment.amount_delta),
            },
        )
        response_serializer = PaymentAdjustmentSerializer(adjustment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class PaymentAdjustmentDecisionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, adjustment_id):
        if not is_admin_user(request.user):
            raise PermissionDenied("Only platform admins can approve or reject payment adjustments.")

        adjustment = get_object_or_404(
            PaymentAdjustment.objects.select_related("payment", "payment__tenancy"),
            id=adjustment_id,
        )
        serializer = PaymentAdjustmentDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        decision = serializer.validated_data["status"]

        adjustment.status = decision
        adjustment.approved_by = request.user
        adjustment.approved_at = timezone.now()

        if decision == PaymentAdjustmentStatus.APPLIED:
            payment = adjustment.payment
            payment._allow_protected_update = True
            payment.amount_paid = payment.amount_paid + adjustment.amount_delta
            if payment.amount_paid < Decimal("0.00"):
                raise PermissionDenied("Applied adjustments cannot reduce the paid amount below zero.")
            if payment.amount_paid == Decimal("0.00"):
                payment.status = PaymentStatus.PENDING
            elif payment.amount_paid < payment.amount_due:
                payment.status = PaymentStatus.PARTIAL
            elif payment.amount_paid == payment.amount_due:
                payment.status = PaymentStatus.PAID
            else:
                raise PermissionDenied("Applied adjustments cannot make the paid amount exceed the due amount.")
            payment.verification_status = PaymentVerificationStatus.DISPUTED
            payment.notes = (
                f"{payment.notes}\n[Adjustment applied #{adjustment.id}] {adjustment.reason}".strip()
            )
            payment.save()

        adjustment.save(update_fields=["status", "approved_by", "approved_at", "updated_at"])
        log_security_event(
            request=request,
            actor=request.user,
            event_type=SecurityEventType.PAYMENT_ADJUSTMENT_DECIDED,
            success=True,
            target_type="payment_adjustment",
            target_id=adjustment.id,
            metadata={
                "decision": decision,
                "payment_id": adjustment.payment_id,
            },
        )
        return Response(PaymentAdjustmentSerializer(adjustment).data, status=status.HTTP_200_OK)


class PaymentIntegritySummaryView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, payment_id):
        payment = get_object_or_404(
            Payment.objects.select_related(
                "tenancy__property",
                "tenancy__tenant__user",
                "tenancy__landlord__user",
                "created_by",
                "approved_by",
            ).prefetch_related("adjustments__created_by", "adjustments__approved_by"),
            id=payment_id,
        )

        if is_admin_user(request.user):
            pass
        elif request.user.role == "landlord":
            landlord = get_authenticated_landlord(request)
            if payment.tenancy.landlord_id != landlord.id:
                raise PermissionDenied("Landlords may only view integrity summaries for their own payments.")
        elif request.user.role == "tenant":
            tenant = get_authenticated_tenant(request)
            if payment.tenancy.tenant_id != tenant.id:
                raise PermissionDenied("Tenants may only view integrity summaries for their own payments.")
        elif request.user.role == "agent":
            agent_property_ids = set(get_active_agent_property_ids(get_authenticated_agent(request)))
            if payment.tenancy.property_id not in agent_property_ids:
                raise PermissionDenied("Agents may only view integrity summaries for managed properties.")
        else:
            raise PermissionDenied("You do not have access to this payment.")

        applied_delta = sum(
            adjustment.amount_delta
            for adjustment in payment.adjustments.all()
            if adjustment.status == PaymentAdjustmentStatus.APPLIED
        )
        effective_amount_paid = payment.amount_paid
        effective_outstanding_balance = payment.amount_due - effective_amount_paid
        payload = {
            "payment": payment,
            "adjustments": payment.adjustments.all(),
            "effective_amount_paid": effective_amount_paid,
            "effective_outstanding_balance": effective_outstanding_balance,
        }
        return Response(PaymentIntegritySummarySerializer(payload).data, status=status.HTTP_200_OK)
