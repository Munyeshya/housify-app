from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.access import (
    ensure_current_agent,
    get_authenticated_agent,
    get_authenticated_landlord,
)
from accounts.models import AgentProfile, AgentType, LandlordProfile
from complaints.models import Complaint
from payments.models import Payment
from properties.models import Property

from .models import AgentAssignmentStatus, PropertyAgentAssignment
from .serializers import (
    AgentIdentitySerializer,
    AgentManagedComplaintSerializer,
    AgentManagedPaymentSerializer,
    ManagedPropertySerializer,
    PrivateAgentCreateSerializer,
    PropertyAgentAssignmentCreateSerializer,
    PropertyAgentAssignmentSerializer,
)


class AvailableAgentListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AgentIdentitySerializer

    def get_queryset(self):
        landlord = get_authenticated_landlord(self.request)

        return AgentProfile.objects.select_related("user", "created_by_landlord").filter(
            Q(agent_type=AgentType.PUBLIC) | Q(created_by_landlord=landlord)
        )


class PrivateAgentCreateView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = PrivateAgentCreateSerializer

    def create(self, request, *args, **kwargs):
        landlord = get_authenticated_landlord(request)
        payload = request.data.copy()
        payload["landlord"] = landlord.id
        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        agent = serializer.save()
        response_serializer = AgentIdentitySerializer(agent)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class AgentAssignmentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        landlord = get_authenticated_landlord(self.request)
        queryset = PropertyAgentAssignment.objects.select_related(
            "agent__user",
            "landlord__user",
            "property",
            "granted_by",
        )
        property_id = self.request.query_params.get("property")
        agent_id = self.request.query_params.get("agent")
        status_value = self.request.query_params.get("status")

        queryset = queryset.filter(landlord=landlord)
        if property_id:
            queryset = queryset.filter(property_id=property_id)
        if agent_id:
            queryset = queryset.filter(agent_id=agent_id)
        if status_value:
            queryset = queryset.filter(status=status_value)

        return queryset

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PropertyAgentAssignmentCreateSerializer
        return PropertyAgentAssignmentSerializer

    def create(self, request, *args, **kwargs):
        landlord = get_authenticated_landlord(request)
        payload = request.data.copy()
        payload["landlord"] = landlord.id
        payload["granted_by"] = request.user.id
        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        assignment = serializer.save()
        response_serializer = PropertyAgentAssignmentSerializer(assignment)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class AgentAssignmentRevokeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, assignment_id):
        landlord = get_authenticated_landlord(request)
        assignment = get_object_or_404(
            PropertyAgentAssignment.objects.select_related("agent__user", "property"),
            id=assignment_id,
            landlord=landlord,
        )
        assignment.status = AgentAssignmentStatus.REVOKED
        assignment.revoked_at = timezone.now()
        assignment.save(update_fields=["status", "revoked_at"])
        return Response(PropertyAgentAssignmentSerializer(assignment).data, status=status.HTTP_200_OK)


class PrivateAgentDeleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def delete(self, request, agent_id):
        landlord = get_authenticated_landlord(request)
        agent = get_object_or_404(
            AgentProfile.objects.select_related("user", "created_by_landlord"),
            id=agent_id,
        )

        if agent.agent_type != AgentType.PRIVATE:
            return Response(
                {"detail": "Public agents cannot be deleted by a landlord."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if agent.created_by_landlord_id != landlord.id:
            return Response(
                {"detail": "Private agents can only be deleted by the landlord who created them."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        agent.property_assignments.filter(status=AgentAssignmentStatus.ACTIVE).update(
            status=AgentAssignmentStatus.REVOKED,
            revoked_at=timezone.now(),
        )
        user = agent.user
        agent.delete()
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AgentManagedPropertiesView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ManagedPropertySerializer

    def get_queryset(self):
        agent = get_authenticated_agent(self.request)
        ensure_current_agent(agent, self.kwargs["agent_id"])
        self.assignment_map = {
            assignment.property_id: assignment
            for assignment in PropertyAgentAssignment.objects.select_related("agent", "property").filter(
                agent=agent,
                status=AgentAssignmentStatus.ACTIVE,
            )
        }
        return Property.objects.filter(id__in=self.assignment_map.keys()).prefetch_related("tenancies__tenant__user")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["assignment_map"] = getattr(self, "assignment_map", {})
        return context

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        data = []
        for property_obj in queryset:
            assignment = self.assignment_map[property_obj.id]
            serializer = self.get_serializer(property_obj, context={"assignment": assignment})
            data.append(serializer.data)
        return Response(data)


class AgentManagedPaymentsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AgentManagedPaymentSerializer

    def get_queryset(self):
        agent = get_authenticated_agent(self.request)
        ensure_current_agent(agent, self.kwargs["agent_id"])
        property_ids = PropertyAgentAssignment.objects.filter(
            agent=agent,
            status=AgentAssignmentStatus.ACTIVE,
        ).values_list("property_id", flat=True)
        return Payment.objects.select_related("tenancy__property").filter(tenancy__property_id__in=property_ids)


class AgentManagedComplaintsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AgentManagedComplaintSerializer

    def get_queryset(self):
        agent = get_authenticated_agent(self.request)
        ensure_current_agent(agent, self.kwargs["agent_id"])
        property_ids = PropertyAgentAssignment.objects.filter(
            agent=agent,
            status=AgentAssignmentStatus.ACTIVE,
        ).values_list("property_id", flat=True)
        return Complaint.objects.select_related("tenancy__property").filter(tenancy__property_id__in=property_ids)
