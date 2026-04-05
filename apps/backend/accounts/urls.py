from django.urls import path

from .views import AgentRegistrationView, LandlordRegistrationView, TenantRegistrationView

urlpatterns = [
    path("register/landlord/", LandlordRegistrationView.as_view(), name="register-landlord"),
    path("register/tenant/", TenantRegistrationView.as_view(), name="register-tenant"),
    path("register/agent/", AgentRegistrationView.as_view(), name="register-agent"),
]
