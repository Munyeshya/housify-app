import math

from rest_framework import serializers

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
        cover_image = obj.images.filter(is_cover=True).first() or obj.images.first()
        return cover_image.image_url if cover_image else None

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
