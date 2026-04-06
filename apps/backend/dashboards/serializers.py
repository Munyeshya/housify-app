from rest_framework import serializers


class DashboardStatSerializer(serializers.Serializer):
    label = serializers.CharField()
    value = serializers.IntegerField()


class PaymentSnapshotSerializer(serializers.Serializer):
    total_due = serializers.DecimalField(max_digits=14, decimal_places=2)
    total_paid = serializers.DecimalField(max_digits=14, decimal_places=2)
    outstanding_balance = serializers.DecimalField(max_digits=14, decimal_places=2)
    pending_count = serializers.IntegerField()
    paid_count = serializers.IntegerField()
    partial_count = serializers.IntegerField()


class ComplaintSnapshotSerializer(serializers.Serializer):
    total = serializers.IntegerField()
    open = serializers.IntegerField()
    in_review = serializers.IntegerField()
    escalated = serializers.IntegerField()
    resolved = serializers.IntegerField()
    closed = serializers.IntegerField()


class LandlordDashboardSerializer(serializers.Serializer):
    landlord = serializers.IntegerField()
    property_stats = DashboardStatSerializer(many=True)
    tenancy_stats = DashboardStatSerializer(many=True)
    payment_snapshot = PaymentSnapshotSerializer()
    complaint_snapshot = ComplaintSnapshotSerializer()
    public_listing_count = serializers.IntegerField()
    private_listing_count = serializers.IntegerField()
    active_agent_count = serializers.IntegerField()


class TenantDashboardSerializer(serializers.Serializer):
    tenant = serializers.IntegerField()
    saved_property_count = serializers.IntegerField()
    current_tenancy_count = serializers.IntegerField()
    past_tenancy_count = serializers.IntegerField()
    payment_snapshot = PaymentSnapshotSerializer()
    complaint_snapshot = ComplaintSnapshotSerializer()
    has_legal_document = serializers.BooleanField()


class AgentDashboardSerializer(serializers.Serializer):
    agent = serializers.IntegerField()
    managed_property_count = serializers.IntegerField()
    managed_active_tenancy_count = serializers.IntegerField()
    payment_snapshot = PaymentSnapshotSerializer()
    complaint_snapshot = ComplaintSnapshotSerializer()
    can_view_legal_id = serializers.BooleanField()
