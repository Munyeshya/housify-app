from django.urls import path

from .views import (
    LandlordDocumentVerificationAccessStatusView,
    PlatformDocumentVerificationAccessView,
    TenantLegalDocumentAccessView,
    TenantLegalDocumentDestroyView,
    TenantLegalDocumentVerificationView,
    TenantLegalDocumentListCreateView,
)


urlpatterns = [
    path("legal-id/", TenantLegalDocumentListCreateView.as_view(), name="legal-document-list-create"),
    path("legal-id/<int:document_id>/", TenantLegalDocumentDestroyView.as_view(), name="legal-document-destroy"),
    path("legal-id/access/", TenantLegalDocumentAccessView.as_view(), name="legal-document-access"),
    path("legal-id/verification-access/", PlatformDocumentVerificationAccessView.as_view(), name="document-verification-access"),
    path("legal-id/verification-access/me/", LandlordDocumentVerificationAccessStatusView.as_view(), name="document-verification-access-status"),
    path("legal-id/verify/", TenantLegalDocumentVerificationView.as_view(), name="legal-document-verify"),
]
