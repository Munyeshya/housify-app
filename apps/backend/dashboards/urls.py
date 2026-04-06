from django.urls import path

from .views import AdminDashboardView, AgentDashboardView, LandlordDashboardView, TenantDashboardView


urlpatterns = [
    path("admin/", AdminDashboardView.as_view(), name="admin-dashboard"),
    path("landlord/", LandlordDashboardView.as_view(), name="landlord-dashboard"),
    path("tenant/", TenantDashboardView.as_view(), name="tenant-dashboard"),
    path("agent/", AgentDashboardView.as_view(), name="agent-dashboard"),
]
