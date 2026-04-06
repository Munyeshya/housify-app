from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.access import get_authenticated_landlord
from properties.models import Property, PropertyStatus

from .serializers import LandlordMapSummarySerializer, PropertyMapPinSerializer, haversine_distance_km


class PropertyMapQueryMixin:
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
            Property.objects.filter(is_public=True)
            .exclude(status__in=[PropertyStatus.DRAFT, PropertyStatus.ARCHIVED, PropertyStatus.HIDDEN])
            .exclude(latitude__isnull=True)
            .exclude(longitude__isnull=True)
            .prefetch_related("images")
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
