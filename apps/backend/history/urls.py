from django.urls import path

from .views import TenantHistoryLookupCreateView, TenantHistoryLookupListView


urlpatterns = [
    path("lookups/", TenantHistoryLookupListView.as_view(), name="tenant-history-lookup-list"),
    path("lookup/", TenantHistoryLookupCreateView.as_view(), name="tenant-history-lookup-create"),
]
