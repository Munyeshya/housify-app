from django.urls import path

from .views import TenancyListCreateView, TenantHistoryByIdentifierView

urlpatterns = [
    path("", TenancyListCreateView.as_view(), name="tenancy-list-create"),
    path(
        "history/<uuid:tenant_identifier>/",
        TenantHistoryByIdentifierView.as_view(),
        name="tenant-history-by-identifier",
    ),
]
