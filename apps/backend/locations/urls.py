from django.urls import path

from .views import (
    LandlordPropertyMapView,
    PublicCellCountsView,
    PublicDistrictCountsView,
    PublicPropertyMapView,
    PublicSectorCountsView,
    PublicVillageCountsView,
)


urlpatterns = [
    path("public-map/", PublicPropertyMapView.as_view(), name="public-property-map"),
    path("landlord-map/", LandlordPropertyMapView.as_view(), name="landlord-property-map"),
    path("counts/districts/", PublicDistrictCountsView.as_view(), name="public-district-counts"),
    path("counts/districts/<int:district_id>/sectors/", PublicSectorCountsView.as_view(), name="public-sector-counts"),
    path("counts/sectors/<int:sector_id>/cells/", PublicCellCountsView.as_view(), name="public-cell-counts"),
    path("counts/cells/<int:cell_id>/villages/", PublicVillageCountsView.as_view(), name="public-village-counts"),
]
