from django.urls import path

from .views import (
    AgentRegistrationView,
    AgentProfileView,
    LandlordRegistrationView,
    LandlordProfileView,
    LoginView,
    LogoutView,
    MeView,
    TenantProfileView,
    TenantRegistrationView,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("profile/landlord/", LandlordProfileView.as_view(), name="landlord-profile"),
    path("profile/tenant/", TenantProfileView.as_view(), name="tenant-profile"),
    path("profile/agent/", AgentProfileView.as_view(), name="agent-profile"),
    path("register/landlord/", LandlordRegistrationView.as_view(), name="register-landlord"),
    path("register/tenant/", TenantRegistrationView.as_view(), name="register-tenant"),
    path("register/agent/", AgentRegistrationView.as_view(), name="register-agent"),
]
