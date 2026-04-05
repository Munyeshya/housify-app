from rest_framework import serializers

from accounts.models import TenantProfile
from properties.models import Property, PropertyStatus

from .models import PropertyBookmark


class BookmarkedPropertySerializer(serializers.ModelSerializer):
    cover_image_url = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = (
            "id",
            "property_reference",
            "title",
            "property_type",
            "status",
            "city",
            "neighborhood",
            "rent_amount",
            "currency",
            "cover_image_url",
        )

    def get_cover_image_url(self, obj):
        cover_image = next((image for image in obj.images.all() if image.is_cover), None)
        if cover_image:
            return cover_image.image_url
        first_image = next(iter(obj.images.all()), None)
        return first_image.image_url if first_image else None


class PropertyBookmarkSerializer(serializers.ModelSerializer):
    property = BookmarkedPropertySerializer(read_only=True)

    class Meta:
        model = PropertyBookmark
        fields = ("id", "tenant", "property", "created_at")


class PropertyBookmarkCreateSerializer(serializers.ModelSerializer):
    tenant = serializers.PrimaryKeyRelatedField(queryset=TenantProfile.objects.select_related("user"))
    property = serializers.PrimaryKeyRelatedField(queryset=Property.objects.prefetch_related("images"))

    class Meta:
        model = PropertyBookmark
        fields = ("tenant", "property")

    def validate(self, attrs):
        tenant = attrs["tenant"]
        property_obj = attrs["property"]

        if not property_obj.is_public:
            raise serializers.ValidationError("Only public properties can be bookmarked.")

        if property_obj.status in {
            PropertyStatus.DRAFT,
            PropertyStatus.ARCHIVED,
            PropertyStatus.HIDDEN,
        }:
            raise serializers.ValidationError("Only visible public properties can be bookmarked.")

        if PropertyBookmark.objects.filter(tenant=tenant, property=property_obj).exists():
            raise serializers.ValidationError("This property is already bookmarked by the tenant.")

        return attrs
