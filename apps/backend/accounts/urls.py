from django.urls import path

from .views import (
    AgentRegistrationView,
    LandlordRegistrationView,
    LoginView,
    LogoutView,
    MeView,
    TenantRegistrationView,
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("logout/", LogoutView.as_view(), name="logout"),
    path("me/", MeView.as_view(), name="me"),
    path("register/landlord/", LandlordRegistrationView.as_view(), name="register-landlord"),
    path("register/tenant/", TenantRegistrationView.as_view(), name="register-tenant"),
    path("register/agent/", AgentRegistrationView.as_view(), name="register-agent"),
]
