from django.shortcuts import get_object_or_404
from rest_framework import permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet

from accounts.access import get_authenticated_landlord

from .models import Portfolio, Property, PropertyImage, PropertyStatus
from .serializers import (
    LandlordPropertyListSerializer,
    PortfolioCreateUpdateSerializer,
    PortfolioSerializer,
    PropertyCreateUpdateSerializer,
    PropertyDetailSerializer,
    PropertyImageCreateSerializer,
    PropertyImageSerializer,
    PropertyImageUpdateSerializer,
    PropertyListSerializer,
    PropertyPublishSerializer,
)


class PublicPropertyViewSet(ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]

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


class LandlordPortfolioViewSet(ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        landlord = get_authenticated_landlord(self.request)
        return Portfolio.objects.filter(landlord=landlord).select_related("parent")

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return PortfolioCreateUpdateSerializer
        return PortfolioSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["landlord"] = get_authenticated_landlord(self.request)
        return context

    def perform_create(self, serializer):
        serializer.save(landlord=get_authenticated_landlord(self.request))


class LandlordPropertyViewSet(ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        landlord = get_authenticated_landlord(self.request)
        queryset = Property.objects.filter(landlord=landlord).select_related(
            "portfolio",
            "parent_property",
        ).prefetch_related("images")

        status_value = self.request.query_params.get("status")
        portfolio_id = self.request.query_params.get("portfolio")
        parent_property_id = self.request.query_params.get("parent_property")
        property_type = self.request.query_params.get("property_type")
        is_public = self.request.query_params.get("is_public")

        if status_value:
            queryset = queryset.filter(status=status_value)
        if portfolio_id:
            queryset = queryset.filter(portfolio_id=portfolio_id)
        if parent_property_id:
            queryset = queryset.filter(parent_property_id=parent_property_id)
        if property_type:
            queryset = queryset.filter(property_type=property_type)
        if is_public is not None:
            queryset = queryset.filter(is_public=is_public.lower() == "true")

        return queryset

    def get_serializer_class(self):
        if self.action in {"create", "update", "partial_update"}:
            return PropertyCreateUpdateSerializer
        if self.action == "list":
            return LandlordPropertyListSerializer
        return PropertyDetailSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["landlord"] = get_authenticated_landlord(self.request)
        return context

    def perform_create(self, serializer):
        serializer.save(landlord=get_authenticated_landlord(self.request))

    @action(detail=True, methods=["post"], url_path="publish")
    def publish(self, request, pk=None):
        property_obj = self.get_object()
        serializer = PropertyPublishSerializer(property_obj, data={"is_public": True})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(PropertyDetailSerializer(property_obj).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="hide")
    def hide(self, request, pk=None):
        property_obj = self.get_object()
        serializer = PropertyPublishSerializer(property_obj, data={"is_public": False})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(PropertyDetailSerializer(property_obj).data, status=status.HTTP_200_OK)


class PropertyImageListCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, property_id):
        landlord = get_authenticated_landlord(request)
        property_obj = get_object_or_404(
            Property.objects.prefetch_related("images"),
            id=property_id,
            landlord=landlord,
        )
        return Response(PropertyImageSerializer(property_obj.images.all(), many=True).data, status=status.HTTP_200_OK)

    def post(self, request, property_id):
        landlord = get_authenticated_landlord(request)
        property_obj = get_object_or_404(Property, id=property_id, landlord=landlord)
        serializer = PropertyImageCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        image = serializer.save(property=property_obj)
        return Response(PropertyImageSerializer(image).data, status=status.HTTP_201_CREATED)


class PropertyImageDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, image_id):
        landlord = get_authenticated_landlord(request)
        image = get_object_or_404(
            PropertyImage.objects.select_related("property"),
            id=image_id,
            property__landlord=landlord,
        )
        serializer = PropertyImageUpdateSerializer(image, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(PropertyImageSerializer(image).data, status=status.HTTP_200_OK)

    def delete(self, request, image_id):
        landlord = get_authenticated_landlord(request)
        image = get_object_or_404(
            PropertyImage.objects.select_related("property"),
            id=image_id,
            property__landlord=landlord,
        )
        image.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
