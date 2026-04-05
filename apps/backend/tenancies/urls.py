from django.urls import path

from .views import TenancyListCreateView

urlpatterns = [
    path("", TenancyListCreateView.as_view(), name="tenancy-list-create"),
]
