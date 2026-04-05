from django.urls import path

from .views import (
    AgentAssignmentListCreateView,
    AgentAssignmentRevokeView,
    AgentManagedComplaintsView,
    AgentManagedPaymentsView,
    AgentManagedPropertiesView,
    AvailableAgentListView,
    PrivateAgentCreateView,
    PrivateAgentDeleteView,
)

urlpatterns = [
    path("available/", AvailableAgentListView.as_view(), name="agent-available-list"),
    path("private/", PrivateAgentCreateView.as_view(), name="private-agent-create"),
    path("private/<int:agent_id>/", PrivateAgentDeleteView.as_view(), name="private-agent-delete"),
    path("assignments/", AgentAssignmentListCreateView.as_view(), name="agent-assignment-list-create"),
    path("assignments/<int:assignment_id>/revoke/", AgentAssignmentRevokeView.as_view(), name="agent-assignment-revoke"),
    path("<int:agent_id>/properties/", AgentManagedPropertiesView.as_view(), name="agent-managed-properties"),
    path("<int:agent_id>/payments/", AgentManagedPaymentsView.as_view(), name="agent-managed-payments"),
    path("<int:agent_id>/complaints/", AgentManagedComplaintsView.as_view(), name="agent-managed-complaints"),
]
