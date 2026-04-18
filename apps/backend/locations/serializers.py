import math

from rest_framework import serializers

from .models import Cell, District, Sector, Village
from properties.models import Property


def haversine_distance_km(lat1, lon1, lat2, lon2):
    radius_km = 6371.0
    lat1_rad = math.radians(float(lat1))
    lon1_rad = math.radians(float(lon1))
    lat2_rad = math.radians(float(lat2))
    lon2_rad = math.radians(float(lon2))

    delta_lat = lat2_rad - lat1_rad
    delta_lon = lon2_rad - lon1_rad

    a = (
        math.sin(delta_lat / 2) ** 2
        + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return radius_km * c


class PropertyMapPinSerializer(serializers.ModelSerializer):
    cover_image_url = serializers.SerializerMethodField()
    distance_km = serializers.SerializerMethodField()
    district_area_name = serializers.CharField(source="district_area.name", read_only=True)
    sector_area_name = serializers.CharField(source="sector_area.name", read_only=True)
    cell_area_name = serializers.CharField(source="cell_area.name", read_only=True)
    village_area_name = serializers.CharField(source="village_area.name", read_only=True)

    class Meta:
        model = Property
        fields = (
            "id",
            "property_reference",
            "title",
            "property_type",
            "status",
            "is_public",
            "city",
            "neighborhood",
            "district_area_name",
            "sector_area_name",
            "cell_area_name",
            "village_area_name",
            "country",
            "address_line_1",
            "rent_amount",
            "currency",
            "latitude",
            "longitude",
            "cover_image_url",
            "distance_km",
        )

    def get_cover_image_url(self, obj):
        request = self.context.get("request")
        cover_image = obj.images.filter(is_cover=True).first() or obj.images.first()
        if not cover_image:
            return None
        reference = cover_image.image_reference
        if request and reference and reference.startswith("/"):
            return request.build_absolute_uri(reference)
        return reference

    def get_distance_km(self, obj):
        origin = self.context.get("origin")
        if not origin or obj.latitude is None or obj.longitude is None:
            return None

        distance = haversine_distance_km(
            origin["latitude"],
            origin["longitude"],
            obj.latitude,
            obj.longitude,
        )
        return round(distance, 2)


class LandlordMapSummarySerializer(serializers.Serializer):
    landlord = serializers.IntegerField()
    total_properties = serializers.IntegerField()
    available_properties = serializers.IntegerField()
    occupied_properties = serializers.IntegerField()
    hidden_properties = serializers.IntegerField()
    maintenance_properties = serializers.IntegerField()
    map_points = PropertyMapPinSerializer(many=True)


class LocationCountSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    code = serializers.CharField()
    name = serializers.CharField()
    parent_id = serializers.IntegerField(allow_null=True)
    parent_code = serializers.CharField(allow_null=True)
    center_latitude = serializers.DecimalField(max_digits=9, decimal_places=6, allow_null=True)
    center_longitude = serializers.DecimalField(max_digits=9, decimal_places=6, allow_null=True)
    available_houses_count = serializers.IntegerField()


class DistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = District
        fields = ("id", "code", "name", "center_latitude", "center_longitude")


class SectorSerializer(serializers.ModelSerializer):
    district_id = serializers.IntegerField(source="district.id", read_only=True)
    district_code = serializers.CharField(source="district.code", read_only=True)

    class Meta:
        model = Sector
        fields = (
            "id",
            "code",
            "name",
            "district_id",
            "district_code",
            "center_latitude",
            "center_longitude",
        )


class CellSerializer(serializers.ModelSerializer):
    sector_id = serializers.IntegerField(source="sector.id", read_only=True)
    sector_code = serializers.CharField(source="sector.code", read_only=True)

    class Meta:
        model = Cell
        fields = (
            "id",
            "code",
            "name",
            "sector_id",
            "sector_code",
            "center_latitude",
            "center_longitude",
        )


class VillageSerializer(serializers.ModelSerializer):
    cell_id = serializers.IntegerField(source="cell.id", read_only=True)
    cell_code = serializers.CharField(source="cell.code", read_only=True)

    class Meta:
        model = Village
        fields = (
            "id",
            "code",
            "name",
            "cell_id",
            "cell_code",
            "center_latitude",
            "center_longitude",
        )
