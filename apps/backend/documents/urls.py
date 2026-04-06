from django.urls import path

from .views import (
    TenantLegalDocumentAccessView,
    TenantLegalDocumentDestroyView,
    TenantLegalDocumentListCreateView,
)


urlpatterns = [
    path("legal-id/", TenantLegalDocumentListCreateView.as_view(), name="legal-document-list-create"),
    path("legal-id/<int:document_id>/", TenantLegalDocumentDestroyView.as_view(), name="legal-document-destroy"),
    path("legal-id/access/", TenantLegalDocumentAccessView.as_view(), name="legal-document-access"),
]
