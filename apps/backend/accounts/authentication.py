from datetime import timedelta

from django.conf import settings
from django.utils import timezone
from rest_framework import exceptions
from rest_framework.authentication import TokenAuthentication


class ExpiringTokenAuthentication(TokenAuthentication):
    keyword = "Token"

    def authenticate_credentials(self, key):
        user, token = super().authenticate_credentials(key)

        if not user.is_active:
            raise exceptions.AuthenticationFailed("This account is inactive.")

        ttl_seconds = getattr(settings, "AUTH_TOKEN_TTL_SECONDS", 0)
        if ttl_seconds > 0 and token.created < timezone.now() - timedelta(seconds=ttl_seconds):
            raise exceptions.AuthenticationFailed("Authentication token has expired. Please log in again.")

        return user, token
