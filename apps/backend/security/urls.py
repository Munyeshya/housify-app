from django.urls import path

from .views import (
    SecurityEventListView,
    SecurityFlagDecisionView,
    SecurityFlagListCreateView,
    SecurityManagedUserListView,
    SecurityUserReactivateView,
    SecurityUserSuspendView,
)


urlpatterns = [
    path("events/", SecurityEventListView.as_view(), name="security-event-list"),
    path("flags/", SecurityFlagListCreateView.as_view(), name="security-flag-list-create"),
    path("flags/<int:flag_id>/decision/", SecurityFlagDecisionView.as_view(), name="security-flag-decision"),
    path("users/", SecurityManagedUserListView.as_view(), name="security-user-list"),
    path("users/<int:user_id>/suspend/", SecurityUserSuspendView.as_view(), name="security-user-suspend"),
    path("users/<int:user_id>/reactivate/", SecurityUserReactivateView.as_view(), name="security-user-reactivate"),
]
