from django.db.models import Count, Q
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.access import get_authenticated_landlord
from properties.models import Property, PropertyStatus

from .models import Cell, District, Sector, Village
from .serializers import (
    LandlordMapSummarySerializer,
    LocationCountSerializer,
    PropertyMapPinSerializer,
    haversine_distance_km,
)


class PropertyMapQueryMixin:
    def _build_public_available_related_filter(self, request, prefix="properties__"):
        query = Q(
            **{
                f"{prefix}is_public": True,
                f"{prefix}status": PropertyStatus.AVAILABLE,
            }
        )
        property_type = request.query_params.get("property_type")
        city = request.query_params.get("city")
        min_rent = request.query_params.get("min_rent")
        max_rent = request.query_params.get("max_rent")

        if property_type:
            query &= Q(**{f"{prefix}property_type": property_type})
        if city:
            query &= Q(**{f"{prefix}city__iexact": city})
        if min_rent:
            query &= Q(**{f"{prefix}rent_amount__gte": min_rent})
        if max_rent:
            query &= Q(**{f"{prefix}rent_amount__lte": max_rent})
        return query

    def _parse_origin(self, request):
        latitude = request.query_params.get("latitude")
        longitude = request.query_params.get("longitude")
        if latitude is None or longitude is None:
            return None
        return {
            "latitude": float(latitude),
            "longitude": float(longitude),
        }

    def _apply_shared_filters(self, queryset, request):
        property_type = request.query_params.get("property_type")
        city = request.query_params.get("city")
        district_area = request.query_params.get("district_area")
        sector_area = request.query_params.get("sector_area")
        cell_area = request.query_params.get("cell_area")
        village_area = request.query_params.get("village_area")
        min_rent = request.query_params.get("min_rent")
        max_rent = request.query_params.get("max_rent")
        north = request.query_params.get("north")
        south = request.query_params.get("south")
        east = request.query_params.get("east")
        west = request.query_params.get("west")

        if property_type:
            queryset = queryset.filter(property_type=property_type)
        if city:
            queryset = queryset.filter(city__iexact=city)
        if district_area:
            queryset = queryset.filter(district_area_id=district_area)
        if sector_area:
            queryset = queryset.filter(sector_area_id=sector_area)
        if cell_area:
            queryset = queryset.filter(cell_area_id=cell_area)
        if village_area:
            queryset = queryset.filter(village_area_id=village_area)
        if min_rent:
            queryset = queryset.filter(rent_amount__gte=min_rent)
        if max_rent:
            queryset = queryset.filter(rent_amount__lte=max_rent)
        if north and south:
            queryset = queryset.filter(latitude__lte=north, latitude__gte=south)
        if east and west:
            queryset = queryset.filter(longitude__lte=east, longitude__gte=west)

        return queryset

    def _apply_radius_filter(self, properties, request, origin):
        radius_km = request.query_params.get("radius_km")
        if not origin or not radius_km:
            return properties

        radius_value = float(radius_km)
        return [
            property_obj
            for property_obj in properties
            if property_obj.latitude is not None
            and property_obj.longitude is not None
            and haversine_distance_km(
                origin["latitude"],
                origin["longitude"],
                property_obj.latitude,
                property_obj.longitude,
            )
            <= radius_value
        ]


class PublicPropertyMapView(PropertyMapQueryMixin, APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        origin = self._parse_origin(request)
        queryset = (
            Property.objects.filter(
                is_public=True,
                status=PropertyStatus.AVAILABLE,
            )
            .exclude(latitude__isnull=True)
            .exclude(longitude__isnull=True)
            .prefetch_related("images")
            .select_related("district_area", "sector_area", "cell_area", "village_area")
        )
        queryset = self._apply_shared_filters(queryset, request)
        properties = list(queryset)
        properties = self._apply_radius_filter(properties, request, origin)
        serializer = PropertyMapPinSerializer(properties, many=True, context={"origin": origin})
        return Response(serializer.data, status=status.HTTP_200_OK)


class LandlordPropertyMapView(PropertyMapQueryMixin, APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        landlord = get_authenticated_landlord(request)

        origin = self._parse_origin(request)
        queryset = (
            Property.objects.filter(landlord=landlord)
            .exclude(latitude__isnull=True)
            .exclude(longitude__isnull=True)
            .prefetch_related("images")
            .select_related("district_area", "sector_area", "cell_area", "village_area")
        )
        queryset = self._apply_shared_filters(queryset, request)
        properties = list(queryset)
        properties = self._apply_radius_filter(properties, request, origin)

        serializer = LandlordMapSummarySerializer(
            {
                "landlord": landlord.id,
                "total_properties": len(properties),
                "available_properties": sum(1 for property_obj in properties if property_obj.status == PropertyStatus.AVAILABLE),
                "occupied_properties": sum(1 for property_obj in properties if property_obj.status == PropertyStatus.OCCUPIED),
                "hidden_properties": sum(1 for property_obj in properties if property_obj.status == PropertyStatus.HIDDEN),
                "maintenance_properties": sum(
                    1 for property_obj in properties if property_obj.status == PropertyStatus.MAINTENANCE
                ),
                "map_points": properties,
            },
            context={"origin": origin},
        )
        return Response(serializer.data, status=status.HTTP_200_OK)


class PublicDistrictCountsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        public_available_filter = PropertyMapQueryMixin()._build_public_available_related_filter(request)
        districts = District.objects.annotate(
            available_houses_count=Count("properties", filter=public_available_filter, distinct=True)
        )
        data = [
            {
                "id": district.id,
                "code": district.code,
                "name": district.name,
                "parent_id": None,
                "parent_code": None,
                "center_latitude": district.center_latitude,
                "center_longitude": district.center_longitude,
                "available_houses_count": district.available_houses_count,
            }
            for district in districts
        ]
        return Response(LocationCountSerializer(data, many=True).data, status=status.HTTP_200_OK)


class PublicSectorCountsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, district_id):
        public_available_filter = PropertyMapQueryMixin()._build_public_available_related_filter(request)
        sectors = Sector.objects.filter(district_id=district_id).annotate(
            available_houses_count=Count("properties", filter=public_available_filter, distinct=True)
        )
        data = [
            {
                "id": sector.id,
                "code": sector.code,
                "name": sector.name,
                "parent_id": sector.district_id,
                "parent_code": sector.district.code,
                "center_latitude": sector.center_latitude,
                "center_longitude": sector.center_longitude,
                "available_houses_count": sector.available_houses_count,
            }
            for sector in sectors.select_related("district")
        ]
        return Response(LocationCountSerializer(data, many=True).data, status=status.HTTP_200_OK)


class PublicCellCountsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, sector_id):
        public_available_filter = PropertyMapQueryMixin()._build_public_available_related_filter(request)
        cells = Cell.objects.filter(sector_id=sector_id).annotate(
            available_houses_count=Count("properties", filter=public_available_filter, distinct=True)
        )
        data = [
            {
                "id": cell.id,
                "code": cell.code,
                "name": cell.name,
                "parent_id": cell.sector_id,
                "parent_code": cell.sector.code,
                "center_latitude": cell.center_latitude,
                "center_longitude": cell.center_longitude,
                "available_houses_count": cell.available_houses_count,
            }
            for cell in cells.select_related("sector")
        ]
        return Response(LocationCountSerializer(data, many=True).data, status=status.HTTP_200_OK)


class PublicVillageCountsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, cell_id):
        public_available_filter = PropertyMapQueryMixin()._build_public_available_related_filter(request)
        villages = Village.objects.filter(cell_id=cell_id).annotate(
            available_houses_count=Count("properties", filter=public_available_filter, distinct=True)
        )
        data = [
            {
                "id": village.id,
                "code": village.code,
                "name": village.name,
                "parent_id": village.cell_id,
                "parent_code": village.cell.code,
                "center_latitude": village.center_latitude,
                "center_longitude": village.center_longitude,
                "available_houses_count": village.available_houses_count,
            }
            for village in villages.select_related("cell")
        ]
        return Response(LocationCountSerializer(data, many=True).data, status=status.HTTP_200_OK)
