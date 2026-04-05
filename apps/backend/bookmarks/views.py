from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PropertyBookmark
from .serializers import PropertyBookmarkCreateSerializer, PropertyBookmarkSerializer


class PropertyBookmarkListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = PropertyBookmark.objects.select_related(
            "tenant__user",
            "property",
        ).prefetch_related("property__images")
        tenant_id = self.request.query_params.get("tenant")
        property_id = self.request.query_params.get("property")

        if tenant_id:
            queryset = queryset.filter(tenant_id=tenant_id)
        if property_id:
            queryset = queryset.filter(property_id=property_id)

        return queryset

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PropertyBookmarkCreateSerializer
        return PropertyBookmarkSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        bookmark = serializer.save()
        response_serializer = PropertyBookmarkSerializer(bookmark)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class PropertyBookmarkDestroyView(APIView):
    permission_classes = [permissions.AllowAny]

    def delete(self, request, bookmark_id):
        tenant_id = request.query_params.get("tenant")
        bookmark = get_object_or_404(PropertyBookmark, id=bookmark_id, tenant_id=tenant_id)
        bookmark.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
