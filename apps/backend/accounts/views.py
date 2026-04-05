from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .serializers import (
    AgentRegistrationSerializer,
    LandlordRegistrationSerializer,
    TenantRegistrationSerializer,
    UserSerializer,
)


class RegistrationResponseMixin:
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        response_serializer = UserSerializer(user)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class LandlordRegistrationView(RegistrationResponseMixin, CreateAPIView):
    serializer_class = LandlordRegistrationSerializer


class TenantRegistrationView(RegistrationResponseMixin, CreateAPIView):
    serializer_class = TenantRegistrationSerializer


class AgentRegistrationView(RegistrationResponseMixin, CreateAPIView):
    serializer_class = AgentRegistrationSerializer
