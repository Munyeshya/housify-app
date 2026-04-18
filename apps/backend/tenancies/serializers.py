from rest_framework import serializers
from django.utils import timezone

from accounts.models import TenantProfile
from properties.models import Property

from .models import Tenancy, TenancyStatus


class TenancySerializer(serializers.ModelSerializer):
    property_title = serializers.CharField(source="property.title", read_only=True)
    property_type = serializers.CharField(source="property.property_type", read_only=True)
    property_city = serializers.CharField(source="property.city", read_only=True)
    property_neighborhood = serializers.CharField(source="property.neighborhood", read_only=True)
    property_district = serializers.CharField(source="property.district", read_only=True)
    property_address_line_1 = serializers.CharField(source="property.address_line_1", read_only=True)
    tenant_name = serializers.CharField(source="tenant.user.full_name", read_only=True)
    tenant_identifier = serializers.CharField(source="tenant.tenant_identifier", read_only=True)
    landlord_name = serializers.CharField(source="landlord.display_name", read_only=True)
    property_location = serializers.SerializerMethodField()
    amount_paid_total = serializers.SerializerMethodField()
    payments_recorded = serializers.SerializerMethodField()
    occupancy_end_date = serializers.SerializerMethodField()
    occupancy_duration_days = serializers.SerializerMethodField()
    occupancy_duration_label = serializers.SerializerMethodField()

    class Meta:
        model = Tenancy
        fields = (
            "id",
            "property",
            "property_title",
            "property_type",
            "property_city",
            "property_neighborhood",
            "property_district",
            "property_address_line_1",
            "property_location",
            "tenant",
            "tenant_name",
            "tenant_identifier",
            "landlord",
            "landlord_name",
            "status",
            "start_date",
            "end_date",
            "move_out_date",
            "monthly_rent_snapshot",
            "security_deposit_snapshot",
            "billing_cycle_snapshot",
            "amount_paid_total",
            "payments_recorded",
            "occupancy_end_date",
            "occupancy_duration_days",
            "occupancy_duration_label",
            "notes",
            "created_at",
        )

    def _payments(self, obj):
        prefetched_payments = getattr(obj, "_prefetched_objects_cache", {}).get("payments")
        if prefetched_payments is not None:
            return prefetched_payments
        return list(obj.payments.all())

    def _occupancy_end_date(self, obj):
        if obj.move_out_date:
            return obj.move_out_date
        if obj.end_date:
            return obj.end_date
        if obj.status == TenancyStatus.ACTIVE:
            return timezone.localdate()
        return None

    def get_property_location(self, obj):
        property_obj = obj.property
        parts = [
            property_obj.address_line_1,
            property_obj.neighborhood,
            property_obj.district,
            property_obj.city,
        ]
        return ", ".join(part for part in parts if part)

    def get_amount_paid_total(self, obj):
        return sum((payment.amount_paid for payment in self._payments(obj)), start=0)

    def get_payments_recorded(self, obj):
        return len(self._payments(obj))

    def get_occupancy_end_date(self, obj):
        end_date = self._occupancy_end_date(obj)
        return end_date.isoformat() if end_date else None

    def get_occupancy_duration_days(self, obj):
        if not obj.start_date:
            return 0

        end_date = self._occupancy_end_date(obj)
        if not end_date or end_date < obj.start_date:
            return 0

        return (end_date - obj.start_date).days + 1

    def get_occupancy_duration_label(self, obj):
        total_days = self.get_occupancy_duration_days(obj)
        if total_days <= 0:
            if obj.status == TenancyStatus.PENDING:
                return "Starts soon"
            return "Not available"

        months = total_days // 30
        remaining_days = total_days % 30

        if months and remaining_days:
            return f"{months} mo {remaining_days} day{'s' if remaining_days != 1 else ''}"
        if months:
            return f"{months} month{'s' if months != 1 else ''}"
        return f"{total_days} day{'s' if total_days != 1 else ''}"


class TenancyCreateSerializer(serializers.ModelSerializer):
    property = serializers.PrimaryKeyRelatedField(queryset=Property.objects.all())
    tenant = serializers.PrimaryKeyRelatedField(queryset=TenantProfile.objects.select_related("user"))

    class Meta:
        model = Tenancy
        fields = (
            "property",
            "tenant",
            "status",
            "start_date",
            "end_date",
            "move_out_date",
            "monthly_rent_snapshot",
            "security_deposit_snapshot",
            "billing_cycle_snapshot",
            "notes",
        )

    def validate(self, attrs):
        property_obj = attrs["property"]
        landlord = self.context["landlord"]
        tenant = attrs["tenant"]

        if property_obj.landlord_id != landlord.id:
            raise serializers.ValidationError("This property does not belong to the provided landlord.")

        if not tenant.has_legal_id_document:
            raise serializers.ValidationError("A tenant must have a legal ID document before assignment.")

        if attrs.get("status") in {TenancyStatus.ACTIVE, TenancyStatus.PENDING}:
            existing_open_tenancy = Tenancy.objects.filter(
                property=property_obj,
                status__in=[TenancyStatus.PENDING, TenancyStatus.ACTIVE],
            )
            if existing_open_tenancy.exists():
                raise serializers.ValidationError("This property already has an open tenancy.")

        return attrs
