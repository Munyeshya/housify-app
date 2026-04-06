from django.utils import timezone
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


class PortfolioCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Portfolio
        fields = ("name", "description", "parent", "is_archived")

    def validate_parent(self, value):
        landlord = self.context["landlord"]
        if value and value.landlord_id != landlord.id:
            raise serializers.ValidationError("A portfolio can only be nested under your own portfolios.")
        return value


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


class LandlordPropertyListSerializer(serializers.ModelSerializer):
    cover_image = serializers.SerializerMethodField()
    portfolio_name = serializers.CharField(source="portfolio.name", read_only=True)
    parent_property_title = serializers.CharField(source="parent_property.title", read_only=True)

    class Meta:
        model = Property
        fields = (
            "id",
            "property_reference",
            "name",
            "title",
            "property_type",
            "status",
            "is_public",
            "is_featured",
            "city",
            "neighborhood",
            "rent_amount",
            "currency",
            "billing_cycle",
            "portfolio",
            "portfolio_name",
            "parent_property",
            "parent_property_title",
            "cover_image",
        )

    def get_cover_image(self, obj):
        cover_image = obj.images.filter(is_cover=True).first() or obj.images.first()
        if not cover_image:
            return None
        return PropertyImageSerializer(cover_image).data


class PropertyCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Property
        exclude = ("landlord", "property_reference", "listed_at", "created_at", "updated_at")

    def validate_portfolio(self, value):
        landlord = self.context["landlord"]
        if value and value.landlord_id != landlord.id:
            raise serializers.ValidationError("Properties can only be attached to your own portfolios.")
        return value

    def validate_parent_property(self, value):
        landlord = self.context["landlord"]
        if value and value.landlord_id != landlord.id:
            raise serializers.ValidationError("Sub-properties can only be nested under your own properties.")
        return value

    def validate(self, attrs):
        attrs = super().validate(attrs)
        status_value = attrs.get("status", getattr(self.instance, "status", None))
        is_public = attrs.get("is_public", getattr(self.instance, "is_public", False))
        latitude = attrs.get("latitude", getattr(self.instance, "latitude", None))
        longitude = attrs.get("longitude", getattr(self.instance, "longitude", None))

        if is_public and status_value in {None, "draft", "archived"}:
            raise serializers.ValidationError("Public properties must be active and cannot stay draft or archived.")

        if is_public and (latitude is None or longitude is None):
            raise serializers.ValidationError("Public properties must include latitude and longitude.")

        return attrs


class PropertyPublishSerializer(serializers.Serializer):
    is_public = serializers.BooleanField()

    def update(self, instance, validated_data):
        instance.is_public = validated_data["is_public"]
        if instance.is_public:
            if instance.status in {"draft", "archived"}:
                instance.status = "available"
            instance.listed_at = timezone.now()
        instance.save(update_fields=["is_public", "status", "listed_at", "updated_at"])
        return instance


class PropertyImageCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ("image_url", "caption", "is_cover", "sort_order")


class PropertyImageUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ("caption", "is_cover", "sort_order")
