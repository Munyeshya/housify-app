from django.urls import include, path

from .views import HealthCheckView

urlpatterns = [
    path("health/", HealthCheckView.as_view(), name="health-check"),
    path("accounts/", include("accounts.urls")),
    path("complaints/", include("complaints.urls")),
    path("payments/", include("payments.urls")),
    path("properties/", include("properties.urls")),
    path("tenancies/", include("tenancies.urls")),
]
