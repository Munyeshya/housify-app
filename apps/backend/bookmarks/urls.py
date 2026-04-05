from django.urls import path

from .views import PropertyBookmarkDestroyView, PropertyBookmarkListCreateView


urlpatterns = [
    path("", PropertyBookmarkListCreateView.as_view(), name="bookmark-list-create"),
    path("<int:bookmark_id>/", PropertyBookmarkDestroyView.as_view(), name="bookmark-destroy"),
]
