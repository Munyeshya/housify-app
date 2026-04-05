from rest_framework.routers import DefaultRouter

from .views import PublicPropertyViewSet

router = DefaultRouter()
router.register("public", PublicPropertyViewSet, basename="public-properties")

urlpatterns = router.urls
