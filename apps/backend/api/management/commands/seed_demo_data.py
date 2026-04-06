from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from accounts.models import AgentProfile, AgentType, LandlordProfile, TenantProfile, User, UserRole
from agents.models import AgentAssignmentStatus, PropertyAgentAssignment
from bookmarks.models import PropertyBookmark
from complaints.models import Complaint, ComplaintCategory, ComplaintDirection, ComplaintStatus
from documents.models import LegalDocumentStatus, TenantLegalDocument
from payments.models import Payment, PaymentCategory, PaymentMethod, PaymentStatus
from properties.models import BillingCycle, Portfolio, Property, PropertyImage, PropertyStatus, PropertyType
from tenancies.models import Tenancy, TenancyStatus


class Command(BaseCommand):
    help = "Seed a reusable Housify demo dataset for local frontend and API development."

    demo_users = {
        "landlord": {
            "email": "demo.landlord@housify.test",
            "full_name": "Aline Uwase",
            "phone_number": "0788000001",
            "role": UserRole.LANDLORD,
        },
        "tenant": {
            "email": "demo.tenant@housify.test",
            "full_name": "Patrick Nshuti",
            "phone_number": "0788000002",
            "role": UserRole.TENANT,
        },
        "public_agent": {
            "email": "demo.publicagent@housify.test",
            "full_name": "Grace Mukamana",
            "phone_number": "0788000003",
            "role": UserRole.AGENT,
        },
        "private_agent": {
            "email": "demo.privateagent@housify.test",
            "full_name": "Eric Habimana",
            "phone_number": "0788000004",
            "role": UserRole.AGENT,
        },
    }

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            default="demo12345",
            help="Password to set for all demo users.",
        )
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing demo users before seeding fresh demo data.",
        )

    def handle(self, *args, **options):
        password = options["password"]
        reset = options["reset"]

        with transaction.atomic():
            if reset:
                self._reset_demo_users()

            landlord_user = self._create_or_update_user("landlord", password)
            tenant_user = self._create_or_update_user("tenant", password)
            public_agent_user = self._create_or_update_user("public_agent", password)
            private_agent_user = self._create_or_update_user("private_agent", password)

            landlord_profile, _ = LandlordProfile.objects.update_or_create(
                user=landlord_user,
                defaults={"display_name": "Aline Properties"},
            )
            tenant_profile, _ = TenantProfile.objects.update_or_create(
                user=tenant_user,
                defaults={
                    "legal_id_type": "National ID",
                    "legal_id_number": "1199980012345678",
                    "legal_id_document_url": "https://example.com/demo/legal-id.pdf",
                },
            )
            TenantLegalDocument.objects.update_or_create(
                tenant=tenant_profile,
                defaults={
                    "document_type": "National ID",
                    "document_number": "1199980012345678",
                    "document_url": "https://example.com/demo/legal-id.pdf",
                    "issuing_country": "Rwanda",
                    "status": LegalDocumentStatus.VERIFIED,
                },
            )

            public_agent_profile, _ = AgentProfile.objects.update_or_create(
                user=public_agent_user,
                defaults={
                    "agent_type": AgentType.PUBLIC,
                    "bio": "Public field agent available to multiple landlords.",
                    "created_by_landlord": None,
                },
            )
            private_agent_profile, _ = AgentProfile.objects.update_or_create(
                user=private_agent_user,
                defaults={
                    "agent_type": AgentType.PRIVATE,
                    "bio": "Private landlord assistant for Aline Properties.",
                    "created_by_landlord": landlord_profile,
                },
            )

            root_portfolio, _ = Portfolio.objects.update_or_create(
                landlord=landlord_profile,
                name="Kigali Rentals",
                defaults={
                    "description": "Main portfolio for Kigali residential listings.",
                    "parent": None,
                    "is_archived": False,
                },
            )
            sub_portfolio, _ = Portfolio.objects.update_or_create(
                landlord=landlord_profile,
                name="Kacyiru Apartments",
                defaults={
                    "description": "Nested portfolio for apartment units in Kacyiru.",
                    "parent": root_portfolio,
                    "is_archived": False,
                },
            )

            featured_property, _ = Property.objects.update_or_create(
                landlord=landlord_profile,
                name="green-heights",
                defaults={
                    "portfolio": sub_portfolio,
                    "parent_property": None,
                    "title": "Green Heights Apartments",
                    "short_description": "Modern public two-bedroom apartment in Kacyiru.",
                    "description": "A bright, map-ready apartment listing with parking and nearby amenities.",
                    "property_type": PropertyType.APARTMENT,
                    "status": PropertyStatus.OCCUPIED,
                    "is_public": True,
                    "is_featured": True,
                    "bedrooms": 2,
                    "bathrooms": 2,
                    "kitchens": 1,
                    "living_rooms": 1,
                    "parking_spaces": 1,
                    "area_sqm": Decimal("95.00"),
                    "furnished": True,
                    "pets_allowed": False,
                    "smoking_allowed": False,
                    "address_line_1": "KG 10 Ave",
                    "address_line_2": "",
                    "neighborhood": "Kacyiru",
                    "city": "Kigali",
                    "district": "Gasabo",
                    "country": "Rwanda",
                    "latitude": Decimal("-1.944072"),
                    "longitude": Decimal("30.061885"),
                    "rent_amount": Decimal("450000.00"),
                    "currency": "RWF",
                    "billing_cycle": BillingCycle.MONTHLY,
                    "security_deposit": Decimal("450000.00"),
                    "advance_payment_amount": Decimal("0.00"),
                    "service_charge": Decimal("20000.00"),
                    "late_fee_amount": Decimal("10000.00"),
                    "minimum_lease_months": 6,
                    "utilities_included": "Water, common-area cleaning",
                    "house_rules": "No smoking, no loud parties after 10 PM",
                    "nearby_landmarks": "Kigali Golf Club, Kigali Heights",
                    "listed_at": timezone.now(),
                },
            )
            hidden_property, _ = Property.objects.update_or_create(
                landlord=landlord_profile,
                name="hilltop-villa",
                defaults={
                    "portfolio": root_portfolio,
                    "parent_property": None,
                    "title": "Hilltop Villa",
                    "short_description": "Private villa managed directly by the landlord.",
                    "description": "A hidden premium villa reserved for private landlord workflows.",
                    "property_type": PropertyType.HOUSE,
                    "status": PropertyStatus.AVAILABLE,
                    "is_public": False,
                    "is_featured": False,
                    "bedrooms": 4,
                    "bathrooms": 3,
                    "kitchens": 1,
                    "living_rooms": 2,
                    "parking_spaces": 2,
                    "area_sqm": Decimal("220.00"),
                    "furnished": False,
                    "pets_allowed": True,
                    "smoking_allowed": False,
                    "address_line_1": "KG 22 Ave",
                    "address_line_2": "",
                    "neighborhood": "Nyarutarama",
                    "city": "Kigali",
                    "district": "Gasabo",
                    "country": "Rwanda",
                    "latitude": Decimal("-1.938500"),
                    "longitude": Decimal("30.086000"),
                    "rent_amount": Decimal("1200000.00"),
                    "currency": "RWF",
                    "billing_cycle": BillingCycle.MONTHLY,
                    "security_deposit": Decimal("1200000.00"),
                    "advance_payment_amount": Decimal("0.00"),
                    "service_charge": Decimal("0.00"),
                    "late_fee_amount": Decimal("25000.00"),
                    "minimum_lease_months": 12,
                    "utilities_included": "None",
                    "house_rules": "Pets allowed by approval only",
                    "nearby_landmarks": "Amahoro Stadium",
                },
            )

            self._sync_property_images(featured_property)
            self._sync_property_images(hidden_property, cover_url="https://example.com/demo/hilltop-villa-cover.jpg")

            tenancy, _ = Tenancy.objects.update_or_create(
                landlord=landlord_profile,
                property=featured_property,
                tenant=tenant_profile,
                defaults={
                    "assigned_by": landlord_user,
                    "status": TenancyStatus.ACTIVE,
                    "start_date": timezone.now().date().replace(day=1),
                    "monthly_rent_snapshot": Decimal("450000.00"),
                    "security_deposit_snapshot": Decimal("450000.00"),
                    "billing_cycle_snapshot": BillingCycle.MONTHLY,
                    "notes": "Demo active tenancy for frontend development.",
                },
            )

            Payment.objects.update_or_create(
                tenancy=tenancy,
                reference="DEMO-RENT-001",
                defaults={
                    "category": PaymentCategory.RENT,
                    "status": PaymentStatus.PAID,
                    "method": PaymentMethod.MOBILE_MONEY,
                    "amount_due": Decimal("450000.00"),
                    "amount_paid": Decimal("450000.00"),
                    "currency": "RWF",
                    "paid_at": timezone.now(),
                    "notes": "Demo rent payment.",
                },
            )
            Payment.objects.update_or_create(
                tenancy=tenancy,
                reference="DEMO-SERVICE-001",
                defaults={
                    "category": PaymentCategory.SERVICE_CHARGE,
                    "status": PaymentStatus.PENDING,
                    "method": PaymentMethod.OTHER,
                    "amount_due": Decimal("20000.00"),
                    "amount_paid": Decimal("0.00"),
                    "currency": "RWF",
                    "notes": "Pending monthly service charge.",
                },
            )

            Complaint.objects.update_or_create(
                tenancy=tenancy,
                title="Kitchen sink leak",
                defaults={
                    "created_by": tenant_user,
                    "assigned_to": landlord_user,
                    "description": "The kitchen sink has a small leak under the cabinet.",
                    "category": ComplaintCategory.MAINTENANCE,
                    "direction": ComplaintDirection.TENANT_TO_LANDLORD,
                    "status": ComplaintStatus.OPEN,
                },
            )

            PropertyBookmark.objects.update_or_create(
                tenant=tenant_profile,
                property=featured_property,
            )

            PropertyAgentAssignment.objects.update_or_create(
                landlord=landlord_profile,
                agent=public_agent_profile,
                property=featured_property,
                defaults={
                    "status": AgentAssignmentStatus.ACTIVE,
                    "granted_by": landlord_user,
                    "revoked_at": None,
                },
            )
            PropertyAgentAssignment.objects.update_or_create(
                landlord=landlord_profile,
                agent=private_agent_profile,
                property=featured_property,
                defaults={
                    "status": AgentAssignmentStatus.ACTIVE,
                    "granted_by": landlord_user,
                    "revoked_at": None,
                },
            )

        self.stdout.write(self.style.SUCCESS("Demo Housify data is ready."))
        self.stdout.write("Users:")
        for key, user_data in self.demo_users.items():
            self.stdout.write(f"  - {key}: {user_data['email']} / {password}")

    def _create_or_update_user(self, key, password):
        user_data = self.demo_users[key]
        user, created = User.objects.get_or_create(
            email=user_data["email"],
            defaults={
                "username": user_data["email"],
                "full_name": user_data["full_name"],
                "phone_number": user_data["phone_number"],
                "role": user_data["role"],
            },
        )
        if not created:
            user.full_name = user_data["full_name"]
            user.phone_number = user_data["phone_number"]
            user.role = user_data["role"]
            user.username = user_data["email"]
        user.set_password(password)
        user.save()
        return user

    def _reset_demo_users(self):
        demo_emails = [user["email"] for user in self.demo_users.values()]
        User.objects.filter(email__in=demo_emails).delete()

    def _sync_property_images(self, property_obj, cover_url="https://example.com/demo/green-heights-cover.jpg"):
        image_defaults = [
            (cover_url, "Front exterior", True, 1),
            ("https://example.com/demo/living-room.jpg", "Living room", False, 2),
            ("https://example.com/demo/bedroom.jpg", "Primary bedroom", False, 3),
        ]
        for image_url, caption, is_cover, sort_order in image_defaults:
            PropertyImage.objects.update_or_create(
                property=property_obj,
                image_url=image_url,
                defaults={
                    "caption": caption,
                    "is_cover": is_cover,
                    "sort_order": sort_order,
                },
            )
