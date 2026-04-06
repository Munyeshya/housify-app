from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.access import get_authenticated_tenant

from .models import PropertyBookmark
from .serializers import PropertyBookmarkCreateSerializer, PropertyBookmarkSerializer


class PropertyBookmarkListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        tenant = get_authenticated_tenant(self.request)
        queryset = PropertyBookmark.objects.select_related(
            "tenant__user",
            "property",
        ).prefetch_related("property__images")
        property_id = self.request.query_params.get("property")

        queryset = queryset.filter(tenant=tenant)
        if property_id:
            queryset = queryset.filter(property_id=property_id)

        return queryset

    def get_serializer_class(self):
        if self.request.method == "POST":
            return PropertyBookmarkCreateSerializer
        return PropertyBookmarkSerializer

    def create(self, request, *args, **kwargs):
        tenant = get_authenticated_tenant(request)
        payload = request.data.copy()
        payload["tenant"] = tenant.id
        serializer = self.get_serializer(data=payload)
        serializer.is_valid(raise_exception=True)
        bookmark = serializer.save()
        response_serializer = PropertyBookmarkSerializer(bookmark)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)


class PropertyBookmarkDestroyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, bookmark_id):
        tenant = get_authenticated_tenant(request)
        bookmark = get_object_or_404(PropertyBookmark, id=bookmark_id, tenant=tenant)
        bookmark.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
