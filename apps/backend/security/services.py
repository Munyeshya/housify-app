from .models import SecurityEvent


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
