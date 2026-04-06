from django.urls import path

from .views import LandlordPropertyMapView, PublicPropertyMapView


urlpatterns = [
    path("public-map/", PublicPropertyMapView.as_view(), name="public-property-map"),
    path("landlord-map/", LandlordPropertyMapView.as_view(), name="landlord-property-map"),
]
