from rest_framework import status
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

from .access import get_authenticated_agent, get_authenticated_landlord, get_authenticated_tenant
from .throttles import LoginRateThrottle, RegistrationRateThrottle
from .serializers import (
    AgentRegistrationSerializer,
    AgentProfileSerializer,
    AgentProfileUpdateSerializer,
    LandlordRegistrationSerializer,
    LandlordProfileSerializer,
    LandlordProfileUpdateSerializer,
    LoginSerializer,
    TenantProfileSerializer,
    TenantProfileUpdateSerializer,
    TenantRegistrationSerializer,
    UserSerializer,
)
from security.models import SecurityEventType
from security.services import log_security_event


class RegistrationResponseMixin:
    permission_classes = [AllowAny]
    throttle_classes = [RegistrationRateThrottle]

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


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginRateThrottle]

    def post(self, request):
        serializer = LoginSerializer(data=request.data, context={"request": request})
        if not serializer.is_valid():
            log_security_event(
                request=request,
                event_type=SecurityEventType.LOGIN_FAILURE,
                success=False,
                metadata={"email": request.data.get("email", "")},
            )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        user = serializer.validated_data["user"]
        Token.objects.filter(user=user).delete()
        token = Token.objects.create(user=user)
        log_security_event(
            request=request,
            actor=user,
            event_type=SecurityEventType.LOGIN_SUCCESS,
            success=True,
            target_type="user",
            target_id=user.id,
            metadata={"role": user.role},
        )
        return Response(
            {
                "token": token.key,
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_200_OK,
        )


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        log_security_event(
            request=request,
            actor=request.user,
            event_type=SecurityEventType.LOGOUT,
            success=True,
            target_type="user",
            target_id=request.user.id,
            metadata={"role": request.user.role},
        )
        Token.objects.filter(user=request.user).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)


class LandlordProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_authenticated_landlord(request)
        return Response(LandlordProfileSerializer(profile).data, status=status.HTTP_200_OK)

    def patch(self, request):
        profile = get_authenticated_landlord(request)
        serializer = LandlordProfileUpdateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(LandlordProfileSerializer(profile).data, status=status.HTTP_200_OK)


class TenantProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_authenticated_tenant(request)
        return Response(TenantProfileSerializer(profile).data, status=status.HTTP_200_OK)

    def patch(self, request):
        profile = get_authenticated_tenant(request)
        serializer = TenantProfileUpdateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(TenantProfileSerializer(profile).data, status=status.HTTP_200_OK)


class AgentProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = get_authenticated_agent(request)
        return Response(AgentProfileSerializer(profile).data, status=status.HTTP_200_OK)

    def patch(self, request):
        profile = get_authenticated_agent(request)
        serializer = AgentProfileUpdateSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AgentProfileSerializer(profile).data, status=status.HTTP_200_OK)
