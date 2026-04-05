from rest_framework.permissions import AllowAny
from rest_framework.viewsets import ReadOnlyModelViewSet

from .models import Property, PropertyStatus
from .serializers import PropertyDetailSerializer, PropertyListSerializer


class PublicPropertyViewSet(ReadOnlyModelViewSet):
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = (
            Property.objects.filter(is_public=True)
            .exclude(status__in=[PropertyStatus.DRAFT, PropertyStatus.ARCHIVED])
            .prefetch_related("images", "portfolio", "parent_property")
        )

        property_type = self.request.query_params.get("property_type")
        city = self.request.query_params.get("city")
        min_rent = self.request.query_params.get("min_rent")
        max_rent = self.request.query_params.get("max_rent")

        if property_type:
            queryset = queryset.filter(property_type=property_type)
        if city:
            queryset = queryset.filter(city__iexact=city)
        if min_rent:
            queryset = queryset.filter(rent_amount__gte=min_rent)
        if max_rent:
            queryset = queryset.filter(rent_amount__lte=max_rent)

        return queryset

    def get_serializer_class(self):
        if self.action == "retrieve":
            return PropertyDetailSerializer
        return PropertyListSerializer
