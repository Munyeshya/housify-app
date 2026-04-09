from django.urls import path

from .views import (
    PaymentAdjustmentDecisionView,
    PaymentAdjustmentListCreateView,
    PaymentIntegritySummaryView,
    PaymentListCreateView,
    TenantPaymentCreateView,
)

urlpatterns = [
    path("", PaymentListCreateView.as_view(), name="payment-list-create"),
    path("tenant/submit/", TenantPaymentCreateView.as_view(), name="tenant-payment-submit"),
    path("adjustments/", PaymentAdjustmentListCreateView.as_view(), name="payment-adjustment-list-create"),
    path("adjustments/<int:adjustment_id>/decision/", PaymentAdjustmentDecisionView.as_view(), name="payment-adjustment-decision"),
    path("<int:payment_id>/integrity/", PaymentIntegritySummaryView.as_view(), name="payment-integrity-summary"),
]
