from calendar import monthrange
from dataclasses import dataclass
from datetime import date, timedelta
from decimal import Decimal

from django.db import transaction
from django.utils import timezone

from properties.models import BillingCycle

from .models import Payment, PaymentCategory, PaymentSource, PaymentStatus, PaymentVerificationStatus


@dataclass
class PaymentAllocationResult:
    applied_total: Decimal
    created_future_payment_count: int
    payments: list


def _add_billing_cycle(source_date, billing_cycle):
    if source_date is None:
        source_date = timezone.now().date()

    if billing_cycle == BillingCycle.WEEKLY:
        return source_date + timedelta(days=7)

    if billing_cycle == BillingCycle.YEARLY:
        try:
            return source_date.replace(year=source_date.year + 1)
        except ValueError:
            return source_date.replace(month=2, day=28, year=source_date.year + 1)

    if billing_cycle == BillingCycle.MONTHLY or billing_cycle == BillingCycle.CUSTOM:
        month = source_date.month + 1
        year = source_date.year
        if month > 12:
            month = 1
            year += 1
        day = min(source_date.day, monthrange(year, month)[1])
        return date(year, month, day)

    return source_date + timedelta(days=30)


def _determine_payment_status(payment):
    if payment.amount_paid <= Decimal("0.00"):
        return PaymentStatus.PENDING
    if payment.amount_paid < payment.amount_due:
        return PaymentStatus.PARTIAL
    return PaymentStatus.PAID


def apply_tenant_payment(*, tenant_user, tenancy, amount, method, reference="", notes=""):
    normalized_amount = Decimal(amount)
    remaining_amount = normalized_amount
    touched_payments = []
    created_future_payment_count = 0

    with transaction.atomic():
        outstanding_payments = list(
            Payment.objects.select_for_update().filter(
                tenancy=tenancy,
                category=PaymentCategory.RENT,
                status__in=[PaymentStatus.PENDING, PaymentStatus.PARTIAL],
            ).order_by("due_date", "created_at")
        )

        latest_rent_payment = (
            Payment.objects.select_for_update()
            .filter(tenancy=tenancy, category=PaymentCategory.RENT)
            .order_by("-due_date", "-created_at")
            .first()
        )

        def apply_to_payment(payment, applied_amount):
            payment._allow_protected_update = True
            payment.amount_paid = payment.amount_paid + applied_amount
            payment.status = _determine_payment_status(payment)
            payment.paid_at = timezone.now()
            payment.method = method
            payment.reference = reference or payment.reference
            payment.source = PaymentSource.MANUAL
            payment.verification_status = PaymentVerificationStatus.UNVERIFIED
            if notes:
                payment.notes = notes
            payment.save()
            touched_payments.append(payment)

        for payment in outstanding_payments:
            if remaining_amount <= Decimal("0.00"):
                break

            capacity = payment.amount_due - payment.amount_paid
            if capacity <= Decimal("0.00"):
                continue

            applied_amount = min(capacity, remaining_amount)
            apply_to_payment(payment, applied_amount)
            remaining_amount -= applied_amount

        while remaining_amount > Decimal("0.00"):
            next_due_date = _add_billing_cycle(
                latest_rent_payment.due_date if latest_rent_payment else tenancy.start_date,
                tenancy.billing_cycle_snapshot,
            )
            due_amount = tenancy.monthly_rent_snapshot
            applied_amount = min(due_amount, remaining_amount)
            new_payment = Payment.objects.create(
                tenancy=tenancy,
                category=PaymentCategory.RENT,
                status=PaymentStatus.PENDING,
                method=method,
                amount_due=due_amount,
                amount_paid=Decimal("0.00"),
                currency=tenancy.property.currency,
                due_date=next_due_date,
                source=PaymentSource.MANUAL,
                verification_status=PaymentVerificationStatus.UNVERIFIED,
                created_by=tenant_user,
                reference=reference,
                notes=notes,
            )
            apply_to_payment(new_payment, applied_amount)
            latest_rent_payment = new_payment
            created_future_payment_count += 1
            remaining_amount -= applied_amount

    return PaymentAllocationResult(
        applied_total=normalized_amount - remaining_amount,
        created_future_payment_count=created_future_payment_count,
        payments=touched_payments,
    )
