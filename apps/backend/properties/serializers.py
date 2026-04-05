from rest_framework import serializers

from .models import Portfolio, Property, PropertyImage


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ("id", "image_url", "caption", "is_cover", "sort_order")


class PortfolioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Portfolio
        fields = ("id", "name", "description", "parent", "is_archived")


class PropertyListSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = (
            "id",
            "property_reference",
            "title",
            "short_description",
            "property_type",
            "status",
            "city",
            "neighborhood",
            "country",
            "rent_amount",
            "currency",
            "billing_cycle",
            "bedrooms",
            "bathrooms",
            "parking_spaces",
            "is_featured",
            "available_from",
            "cover_image",
        )

    def get_cover_image(self, obj):
        cover_image = obj.images.filter(is_cover=True).first() or obj.images.first()
        if not cover_image:
            return None
        return PropertyImageSerializer(cover_image).data


class PropertyDetailSerializer(serializers.ModelSerializer):
    images = PropertyImageSerializer(many=True, read_only=True)
    portfolio = PortfolioSerializer(read_only=True)
    parent_property_title = serializers.CharField(source="parent_property.title", read_only=True)

    class Meta:
        model = Property
        fields = (
            "id",
            "property_reference",
            "name",
            "title",
            "short_description",
            "description",
            "property_type",
            "status",
            "is_public",
            "is_featured",
            "bedrooms",
            "bathrooms",
            "kitchens",
            "living_rooms",
            "parking_spaces",
            "area_sqm",
            "furnished",
            "pets_allowed",
            "smoking_allowed",
            "address_line_1",
            "address_line_2",
            "neighborhood",
            "city",
            "district",
            "country",
            "latitude",
            "longitude",
            "rent_amount",
            "currency",
            "billing_cycle",
            "security_deposit",
            "advance_payment_amount",
            "service_charge",
            "late_fee_amount",
            "minimum_lease_months",
            "available_from",
            "utilities_included",
            "house_rules",
            "nearby_landmarks",
            "portfolio",
            "parent_property",
            "parent_property_title",
            "images",
        )
