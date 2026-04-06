from rest_framework.exceptions import PermissionDenied

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


def ensure_current_agent(agent_profile, requested_agent_id):
    if str(agent_profile.id) != str(requested_agent_id):
        raise PermissionDenied("Agents may only access their own managed-property data.")
