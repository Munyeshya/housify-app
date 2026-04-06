from rest_framework.exceptions import PermissionDenied

from agents.models import AgentAssignmentStatus, PropertyAgentAssignment

from .models import UserRole


def get_authenticated_landlord(request):
    if not request.user.is_authenticated or request.user.role != UserRole.LANDLORD:
        raise PermissionDenied("Only authenticated landlords can perform this action.")
    return request.user.landlord_profile


def get_authenticated_tenant(request):
    if not request.user.is_authenticated or request.user.role != UserRole.TENANT:
        raise PermissionDenied("Only authenticated tenants can perform this action.")
    return request.user.tenant_profile


def get_authenticated_agent(request):
    if not request.user.is_authenticated or request.user.role != UserRole.AGENT:
        raise PermissionDenied("Only authenticated agents can perform this action.")
    return request.user.agent_profile


def is_admin_user(user):
    return user.is_authenticated and (user.role == UserRole.ADMIN or user.is_superuser)


def ensure_platform_admin(request):
    if not is_admin_user(request.user):
        raise PermissionDenied("Only platform admins can perform this action.")
    return request.user


def get_active_agent_property_ids(agent_profile):
    return PropertyAgentAssignment.objects.filter(
        agent=agent_profile,
        status=AgentAssignmentStatus.ACTIVE,
    ).values_list("property_id", flat=True)


def ensure_current_agent(agent_profile, requested_agent_id):
    if str(agent_profile.id) != str(requested_agent_id):
        raise PermissionDenied("Agents may only access their own managed-property data.")
