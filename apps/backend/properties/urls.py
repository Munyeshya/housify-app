from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    LandlordPortfolioViewSet,
    LandlordPropertyViewSet,
    PropertyImageDetailView,
    PropertyImageListCreateView,
    PublicPropertyViewSet,
)

router = DefaultRouter()
router.register("portfolios", LandlordPortfolioViewSet, basename="landlord-portfolios")
router.register("manage", LandlordPropertyViewSet, basename="landlord-properties")
router.register("public", PublicPropertyViewSet, basename="public-properties")

urlpatterns = router.urls + [
    path("manage/<int:property_id>/images/", PropertyImageListCreateView.as_view(), name="property-image-list-create"),
    path("images/<int:image_id>/", PropertyImageDetailView.as_view(), name="property-image-detail"),
]
