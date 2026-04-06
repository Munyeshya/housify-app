from decimal import Decimal

from django.db.models import Sum
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.access import (
    get_active_agent_property_ids,
    get_authenticated_agent,
    get_authenticated_landlord,
    get_authenticated_tenant,
)
from complaints.models import Complaint, ComplaintStatus
from payments.models import Payment, PaymentStatus
from properties.models import Property, PropertyStatus
from tenancies.models import Tenancy, TenancyStatus

from .serializers import AgentDashboardSerializer, LandlordDashboardSerializer, TenantDashboardSerializer


def build_payment_snapshot(queryset):
    totals = queryset.aggregate(
        total_due=Sum("amount_due"),
        total_paid=Sum("amount_paid"),
    )
    total_due = totals["total_due"] or Decimal("0")
    total_paid = totals["total_paid"] or Decimal("0")
    return {
        "total_due": total_due,
        "total_paid": total_paid,
        "outstanding_balance": total_due - total_paid,
        "pending_count": queryset.filter(status=PaymentStatus.PENDING).count(),
        "paid_count": queryset.filter(status=PaymentStatus.PAID).count(),
        "partial_count": queryset.filter(status=PaymentStatus.PARTIAL).count(),
    }


def build_complaint_snapshot(queryset):
    return {
        "total": queryset.count(),
        "open": queryset.filter(status=ComplaintStatus.OPEN).count(),
        "in_review": queryset.filter(status=ComplaintStatus.IN_REVIEW).count(),
        "escalated": queryset.filter(status=ComplaintStatus.ESCALATED).count(),
        "resolved": queryset.filter(status=ComplaintStatus.RESOLVED).count(),
        "closed": queryset.filter(status=ComplaintStatus.CLOSED).count(),
    }


class LandlordDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        landlord = get_authenticated_landlord(request)
        properties = Property.objects.filter(landlord=landlord)
        tenancies = Tenancy.objects.filter(landlord=landlord)
        payments = Payment.objects.filter(tenancy__landlord=landlord)
        complaints = Complaint.objects.filter(tenancy__landlord=landlord)

        payload = {
            "landlord": landlord.id,
            "property_stats": [
                {"label": "total", "value": properties.count()},
                {"label": "available", "value": properties.filter(status=PropertyStatus.AVAILABLE).count()},
                {"label": "occupied", "value": properties.filter(status=PropertyStatus.OCCUPIED).count()},
                {"label": "maintenance", "value": properties.filter(status=PropertyStatus.MAINTENANCE).count()},
            ],
            "tenancy_stats": [
                {"label": "active", "value": tenancies.filter(status=TenancyStatus.ACTIVE).count()},
                {"label": "pending", "value": tenancies.filter(status=TenancyStatus.PENDING).count()},
                {"label": "completed", "value": tenancies.filter(status=TenancyStatus.COMPLETED).count()},
                {"label": "terminated", "value": tenancies.filter(status=TenancyStatus.TERMINATED).count()},
            ],
            "payment_snapshot": build_payment_snapshot(payments),
            "complaint_snapshot": build_complaint_snapshot(complaints),
            "public_listing_count": properties.filter(is_public=True).count(),
            "private_listing_count": properties.filter(is_public=False).count(),
            "active_agent_count": landlord.agent_assignments.filter(status="active").values("agent").distinct().count(),
        }
        return Response(LandlordDashboardSerializer(payload).data, status=status.HTTP_200_OK)


class TenantDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        tenant = get_authenticated_tenant(request)
        tenancies = Tenancy.objects.filter(tenant=tenant)
        payments = Payment.objects.filter(tenancy__tenant=tenant)
        complaints = Complaint.objects.filter(tenancy__tenant=tenant)

        payload = {
            "tenant": tenant.id,
            "saved_property_count": tenant.bookmarks.count(),
            "current_tenancy_count": tenancies.filter(status=TenancyStatus.ACTIVE).count(),
            "past_tenancy_count": tenancies.filter(
                status__in=[TenancyStatus.COMPLETED, TenancyStatus.TERMINATED]
            ).count(),
            "payment_snapshot": build_payment_snapshot(payments),
            "complaint_snapshot": build_complaint_snapshot(complaints),
            "has_legal_document": tenant.has_legal_id_document,
        }
        return Response(TenantDashboardSerializer(payload).data, status=status.HTTP_200_OK)


class AgentDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        agent = get_authenticated_agent(request)
        property_ids = list(get_active_agent_property_ids(agent))
        payments = Payment.objects.filter(tenancy__property_id__in=property_ids)
        complaints = Complaint.objects.filter(tenancy__property_id__in=property_ids)
        active_tenancy_count = Tenancy.objects.filter(
            property_id__in=property_ids,
            status=TenancyStatus.ACTIVE,
        ).count()

        payload = {
            "agent": agent.id,
            "managed_property_count": len(property_ids),
            "managed_active_tenancy_count": active_tenancy_count,
            "payment_snapshot": build_payment_snapshot(payments),
            "complaint_snapshot": build_complaint_snapshot(complaints),
            "can_view_legal_id": agent.agent_type == "private",
        }
        return Response(AgentDashboardSerializer(payload).data, status=status.HTTP_200_OK)
