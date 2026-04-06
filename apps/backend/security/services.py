from django.utils import timezone
from rest_framework.authtoken.models import Token

from .models import SecurityEvent, SecurityEventType, SecurityFlag, SecurityFlagStatus


def get_request_ip(request):
    forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


def log_security_event(
    *,
    request,
    event_type,
    actor=None,
    success=True,
    target_type="",
    target_id="",
    metadata=None,
):
    SecurityEvent.objects.create(
        actor=actor,
        event_type=event_type,
        success=success,
        target_type=target_type,
        target_id=str(target_id) if target_id else "",
        ip_address=get_request_ip(request),
        user_agent=request.META.get("HTTP_USER_AGENT", "")[:1000],
        metadata=metadata or {},
    )


def suspend_user(*, request, admin_user, target_user, reason=""):
    target_user.is_active = False
    target_user.save(update_fields=["is_active"])
    Token.objects.filter(user=target_user).delete()
    log_security_event(
        request=request,
        actor=admin_user,
        event_type=SecurityEventType.USER_SUSPENDED,
        success=True,
        target_type="user",
        target_id=target_user.id,
        metadata={"reason": reason, "target_role": target_user.role},
    )
    return target_user


def reactivate_user(*, request, admin_user, target_user, reason=""):
    target_user.is_active = True
    target_user.save(update_fields=["is_active"])
    log_security_event(
        request=request,
        actor=admin_user,
        event_type=SecurityEventType.USER_REACTIVATED,
        success=True,
        target_type="user",
        target_id=target_user.id,
        metadata={"reason": reason, "target_role": target_user.role},
    )
    return target_user


def create_security_flag(*, request, admin_user, **validated_data):
    flag = SecurityFlag.objects.create(created_by=admin_user, **validated_data)
    log_security_event(
        request=request,
        actor=admin_user,
        event_type=SecurityEventType.SECURITY_FLAG_CREATED,
        success=True,
        target_type=flag.target_type,
        target_id=flag.target_id,
        metadata={"severity": flag.severity, "flag_id": flag.id},
    )
    return flag


def decide_security_flag(*, request, admin_user, flag, status_value, resolution_notes=""):
    flag.status = status_value
    flag.resolution_notes = resolution_notes
    if status_value in {SecurityFlagStatus.RESOLVED, SecurityFlagStatus.DISMISSED}:
        flag.resolved_by = admin_user
        flag.resolved_at = timezone.now()
    flag.save()
    log_security_event(
        request=request,
        actor=admin_user,
        event_type=SecurityEventType.SECURITY_FLAG_RESOLVED,
        success=True,
        target_type=flag.target_type,
        target_id=flag.target_id,
        metadata={"flag_id": flag.id, "status": flag.status},
    )
    return flag
