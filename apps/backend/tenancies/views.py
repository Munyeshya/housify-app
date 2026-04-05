from rest_framework import generics, permissions

from .models import Tenancy
from .serializers import TenancyCreateSerializer, TenancySerializer


class TenancyListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.AllowAny]
    queryset = Tenancy.objects.select_related(
        "property",
        "tenant__user",
        "landlord__user",
    )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return TenancyCreateSerializer
        return TenancySerializer
