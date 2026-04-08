from datetime import timedelta
from decimal import Decimal
import random

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify
from faker import Faker

from accounts.models import AgentProfile, AgentType, LandlordProfile, TenantProfile, User, UserRole
from agents.models import AgentAssignmentStatus, PropertyAgentAssignment
from bookmarks.models import PropertyBookmark
from complaints.models import Complaint, ComplaintCategory, ComplaintDirection, ComplaintStatus
from documents.models import LegalDocumentStatus, TenantLegalDocument
from locations.models import Cell, District, Sector, Village
from payments.models import Payment, PaymentCategory, PaymentMethod, PaymentStatus
from properties.models import BillingCycle, Portfolio, Property, PropertyImage, PropertyStatus, PropertyType
from tenancies.models import Tenancy, TenancyStatus


class Command(BaseCommand):
    help = "Seed a reusable Housify dataset with Faker-powered demo and bulk sample data."

    fake_email_domain = "faker.housify.test"

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
    rwanda_cities = [
        ("Kigali", "Gasabo"),
        ("Kigali", "Kicukiro"),
        ("Kigali", "Nyarugenge"),
        ("Musanze", "Musanze"),
        ("Rubavu", "Rubavu"),
        ("Huye", "Huye"),
    ]
    neighborhoods = [
        "Kacyiru",
        "Nyarutarama",
        "Kimihurura",
        "Remera",
        "Gisozi",
        "Kibagabaga",
        "Gacuriro",
        "Kimironko",
    ]
    utilities_options = [
        "Water, security",
        "Water, internet",
        "Water, garbage collection",
        "Water, shared cleaning",
        "None",
    ]
    landmarks = [
        "Kigali Heights",
        "Kigali Golf Club",
        "Amahoro Stadium",
        "Kimironko Market",
        "Convention Centre",
        "BK Arena",
    ]
    location_blueprint = {
        "Gasabo": {
            "center": ("-1.934600", "30.092300"),
            "sectors": {
                "Kacyiru": {
                    "center": ("-1.944072", "30.061885"),
                    "cells": {
                        "Kamatamu": ("Rugando", "Amahoro"),
                        "Kamutwa": ("Kibaza", "Ibuhoro"),
                    },
                },
                "Remera": {
                    "center": ("-1.949900", "30.112200"),
                    "cells": {
                        "Rukiri I": ("Giporoso", "Nyabisindu"),
                        "Nyarutarama": ("Kibagabaga", "Vision City"),
                    },
                },
            },
        },
        "Kicukiro": {
            "center": ("-1.970600", "30.116300"),
            "sectors": {
                "Kagarama": {
                    "center": ("-1.987100", "30.094700"),
                    "cells": {
                        "Kanserege": ("Kanserege I", "Kanserege II"),
                        "Muyange": ("Muyange I", "Muyange II"),
                    },
                },
                "Kanombe": {
                    "center": ("-1.983200", "30.169500"),
                    "cells": {
                        "Busanza": ("Busanza I", "Busanza II"),
                        "Karama": ("Karama I", "Karama II"),
                    },
                },
            },
        },
        "Nyarugenge": {
            "center": ("-1.952600", "30.058700"),
            "sectors": {
                "Kimisagara": {
                    "center": ("-1.958200", "30.039700"),
                    "cells": {
                        "Kamuhoza": ("Kamuhoza I", "Kamuhoza II"),
                        "Katabaro": ("Katabaro I", "Katabaro II"),
                    },
                },
                "Nyamirambo": {
                    "center": ("-1.970500", "30.041400"),
                    "cells": {
                        "Cyivugiza": ("Cyivugiza I", "Cyivugiza II"),
                        "Mumena": ("Mumena I", "Mumena II"),
                    },
                },
            },
        },
        "Musanze": {
            "center": ("-1.499300", "29.634100"),
            "sectors": {
                "Muhoza": {
                    "center": ("-1.499000", "29.634600"),
                    "cells": {
                        "Kigombe": ("Kigombe I", "Kigombe II"),
                        "Mpenge": ("Mpenge I", "Mpenge II"),
                    },
                },
                "Cyuve": {
                    "center": ("-1.531300", "29.622100"),
                    "cells": {
                        "Kabeza": ("Kabeza I", "Kabeza II"),
                        "Buruba": ("Buruba I", "Buruba II"),
                    },
                },
            },
        },
        "Rubavu": {
            "center": ("-1.679000", "29.258500"),
            "sectors": {
                "Gisenyi": {
                    "center": ("-1.702800", "29.256700"),
                    "cells": {
                        "Nengo": ("Nengo I", "Nengo II"),
                        "Umuganda": ("Umuganda I", "Umuganda II"),
                    },
                },
                "Rubavu": {
                    "center": ("-1.678400", "29.325000"),
                    "cells": {
                        "Buhaza": ("Buhaza I", "Buhaza II"),
                        "Burinda": ("Burinda I", "Burinda II"),
                    },
                },
            },
        },
        "Huye": {
            "center": ("-2.596700", "29.739400"),
            "sectors": {
                "Ngoma": {
                    "center": ("-2.596000", "29.741500"),
                    "cells": {
                        "Matyazo": ("Matyazo I", "Matyazo II"),
                        "Kaburemera": ("Kaburemera I", "Kaburemera II"),
                    },
                },
                "Tumba": {
                    "center": ("-2.601600", "29.744400"),
                    "cells": {
                        "Cyarwa": ("Cyarwa I", "Cyarwa II"),
                        "Rango A": ("Rango A I", "Rango A II"),
                    },
                },
            },
        },
    }
    neighborhood_sector_preferences = {
        "Kacyiru": "Kacyiru",
        "Kimihurura": "Kacyiru",
        "Gisozi": "Kacyiru",
        "Gacuriro": "Kacyiru",
        "Remera": "Remera",
        "Nyarutarama": "Remera",
        "Kibagabaga": "Remera",
        "Kimironko": "Remera",
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
            help="Delete existing demo and Faker users before seeding fresh data.",
        )
        parser.add_argument(
            "--seed",
            type=int,
            default=42,
            help="Deterministic random seed for Faker-generated data.",
        )
        parser.add_argument(
            "--landlords",
            type=int,
            default=3,
            help="Number of additional Faker landlords to create.",
        )
        parser.add_argument(
            "--tenants",
            type=int,
            default=18,
            help="Number of additional Faker tenants to create.",
        )
        parser.add_argument(
            "--public-agents",
            type=int,
            default=4,
            help="Number of additional public agents to create.",
        )
        parser.add_argument(
            "--private-agents-per-landlord",
            type=int,
            default=1,
            help="Number of private agents to create for each Faker landlord.",
        )
        parser.add_argument(
            "--properties-per-landlord",
            type=int,
            default=5,
            help="Number of properties to create for each Faker landlord.",
        )

    def handle(self, *args, **options):
        password = options["password"]
        reset = options["reset"]
        self.randomizer = random.Random(options["seed"])
        self.fake = Faker()
        Faker.seed(options["seed"])
        self.fake.seed_instance(options["seed"])
        self.location_tree = self._bootstrap_rwanda_location_hierarchy()

        with transaction.atomic():
            if reset:
                self._reset_seeded_users()

            seeded = self._seed_demo_core(password)
            fake_landlords = self._seed_fake_landlords(password, options["landlords"])
            fake_tenants = self._seed_fake_tenants(password, options["tenants"])
            fake_public_agents = self._seed_fake_public_agents(password, options["public_agents"])

            all_landlords = [seeded["landlord_profile"], *fake_landlords]
            all_tenants = [seeded["tenant_profile"], *fake_tenants]
            all_public_agents = [seeded["public_agent_profile"], *fake_public_agents]

            self._seed_fake_property_data(
                landlords=all_landlords,
                tenants=all_tenants,
                public_agents=all_public_agents,
                password=password,
                properties_per_landlord=options["properties_per_landlord"],
                private_agents_per_landlord=options["private_agents_per_landlord"],
            )
            self._backfill_existing_property_locations()
            bookmark_count = self._seed_bookmarks(all_tenants)

        self.stdout.write(self.style.SUCCESS("Housify sample data is ready."))
        self.stdout.write(
            f"Seeded {len(all_landlords)} landlords, {len(all_tenants)} tenants, "
            f"{len(all_public_agents)} public agents, and {bookmark_count} bookmarks."
        )
        self.stdout.write("Demo login users:")
        for key, user_data in self.demo_users.items():
            self.stdout.write(f"  - {key}: {user_data['email']} / {password}")

    def _seed_demo_core(self, password):
        landlord_user = self._create_or_update_fixed_user("landlord", password)
        tenant_user = self._create_or_update_fixed_user("tenant", password)
        public_agent_user = self._create_or_update_fixed_user("public_agent", password)
        private_agent_user = self._create_or_update_fixed_user("private_agent", password)

        landlord_profile, _ = LandlordProfile.objects.update_or_create(
            user=landlord_user,
            defaults={"display_name": "Aline Properties"},
        )
        tenant_profile = self._create_or_update_tenant_profile(
            user=tenant_user,
            document_type="National ID",
            document_number="1199980012345678",
            document_url="https://example.com/demo/legal-id.pdf",
            issuing_country="Rwanda",
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

        featured_property = self._create_or_update_property(
            landlord=landlord_profile,
            portfolio=sub_portfolio,
            slug_name="green-heights",
            title="Green Heights Apartments",
            property_type=PropertyType.APARTMENT,
            status=PropertyStatus.OCCUPIED,
            is_public=True,
            is_featured=True,
            city="Kigali",
            district="Gasabo",
            neighborhood="Kacyiru",
            latitude=Decimal("-1.944072"),
            longitude=Decimal("30.061885"),
            rent_amount=Decimal("450000.00"),
            security_deposit=Decimal("450000.00"),
            service_charge=Decimal("20000.00"),
            late_fee_amount=Decimal("10000.00"),
            bedrooms=2,
            bathrooms=2,
            area_sqm=Decimal("95.00"),
            furnished=True,
            pets_allowed=False,
            short_description="Modern public two-bedroom apartment in Kacyiru.",
            description="A bright, map-ready apartment listing with parking and nearby amenities.",
            address_line_1="KG 10 Ave",
            utilities_included="Water, common-area cleaning",
            house_rules="No smoking, no loud parties after 10 PM",
            nearby_landmarks="Kigali Golf Club, Kigali Heights",
            listed_at=timezone.now(),
            location_path=self._resolve_location_path("Gasabo", "Kacyiru"),
        )
        hidden_property = self._create_or_update_property(
            landlord=landlord_profile,
            portfolio=root_portfolio,
            slug_name="hilltop-villa",
            title="Hilltop Villa",
            property_type=PropertyType.HOUSE,
            status=PropertyStatus.AVAILABLE,
            is_public=False,
            is_featured=False,
            city="Kigali",
            district="Gasabo",
            neighborhood="Nyarutarama",
            latitude=Decimal("-1.938500"),
            longitude=Decimal("30.086000"),
            rent_amount=Decimal("1200000.00"),
            security_deposit=Decimal("1200000.00"),
            service_charge=Decimal("0.00"),
            late_fee_amount=Decimal("25000.00"),
            bedrooms=4,
            bathrooms=3,
            area_sqm=Decimal("220.00"),
            furnished=False,
            pets_allowed=True,
            short_description="Private villa managed directly by the landlord.",
            description="A hidden premium villa reserved for private landlord workflows.",
            address_line_1="KG 22 Ave",
            utilities_included="None",
            house_rules="Pets allowed by approval only",
            nearby_landmarks="Amahoro Stadium",
            listed_at=None,
            location_path=self._resolve_location_path("Gasabo", "Nyarutarama"),
        )

        self._sync_property_images(featured_property, "green-heights")
        self._sync_property_images(hidden_property, "hilltop-villa")
        tenancy = self._create_or_update_tenancy(
            property_obj=featured_property,
            landlord=landlord_profile,
            tenant=tenant_profile,
            assigned_by=landlord_user,
            status=TenancyStatus.ACTIVE,
            start_date=timezone.now().date().replace(day=1),
            notes="Demo active tenancy for frontend development.",
        )
        self._create_or_update_payment(
            tenancy=tenancy,
            reference="DEMO-RENT-001",
            category=PaymentCategory.RENT,
            status=PaymentStatus.PAID,
            method=PaymentMethod.MOBILE_MONEY,
            amount_due=Decimal("450000.00"),
            amount_paid=Decimal("450000.00"),
            notes="Demo rent payment.",
            paid_at=timezone.now(),
        )
        self._create_or_update_payment(
            tenancy=tenancy,
            reference="DEMO-SERVICE-001",
            category=PaymentCategory.SERVICE_CHARGE,
            status=PaymentStatus.PENDING,
            method=PaymentMethod.OTHER,
            amount_due=Decimal("20000.00"),
            amount_paid=Decimal("0.00"),
            notes="Pending monthly service charge.",
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
        self._create_or_update_assignment(landlord_profile, public_agent_profile, featured_property, landlord_user)
        self._create_or_update_assignment(landlord_profile, private_agent_profile, featured_property, landlord_user)

        return {
            "landlord_profile": landlord_profile,
            "tenant_profile": tenant_profile,
            "public_agent_profile": public_agent_profile,
            "private_agent_profile": private_agent_profile,
        }

    def _seed_fake_landlords(self, password, count):
        landlords = []
        for index in range(1, count + 1):
            full_name = self.fake.unique.name()
            email = f"landlord{index:03d}@{self.fake_email_domain}"
            phone_number = self._phone_number(index)
            user, _ = User.objects.update_or_create(
                email=email,
                defaults={
                    "username": email,
                    "full_name": full_name,
                    "phone_number": phone_number,
                    "role": UserRole.LANDLORD,
                },
            )
            user.set_password(password)
            user.save(update_fields=["password"])
            landlord_profile, _ = LandlordProfile.objects.update_or_create(
                user=user,
                defaults={"display_name": f"{full_name.split()[0]} Estates"},
            )
            landlords.append(landlord_profile)
        return landlords

    def _seed_fake_tenants(self, password, count):
        tenants = []
        for index in range(1, count + 1):
            full_name = self.fake.unique.name()
            email = f"tenant{index:03d}@{self.fake_email_domain}"
            phone_number = self._phone_number(200 + index)
            user, _ = User.objects.update_or_create(
                email=email,
                defaults={
                    "username": email,
                    "full_name": full_name,
                    "phone_number": phone_number,
                    "role": UserRole.TENANT,
                },
            )
            user.set_password(password)
            user.save(update_fields=["password"])
            tenant_profile = self._create_or_update_tenant_profile(
                user=user,
                document_type="National ID",
                document_number=f"11999{index:05d}",
                document_url=f"https://example.com/faker/tenant-{index:03d}-id.pdf",
                issuing_country="Rwanda",
            )
            tenants.append(tenant_profile)
        return tenants

    def _seed_fake_public_agents(self, password, count):
        agents = []
        for index in range(1, count + 1):
            full_name = self.fake.unique.name()
            email = f"publicagent{index:03d}@{self.fake_email_domain}"
            phone_number = self._phone_number(500 + index)
            user, _ = User.objects.update_or_create(
                email=email,
                defaults={
                    "username": email,
                    "full_name": full_name,
                    "phone_number": phone_number,
                    "role": UserRole.AGENT,
                },
            )
            user.set_password(password)
            user.save(update_fields=["password"])
            agent_profile, _ = AgentProfile.objects.update_or_create(
                user=user,
                defaults={
                    "agent_type": AgentType.PUBLIC,
                    "bio": self.fake.sentence(nb_words=14),
                    "created_by_landlord": None,
                },
            )
            agents.append(agent_profile)
        return agents

    def _seed_fake_property_data(
        self,
        landlords,
        tenants,
        public_agents,
        password,
        properties_per_landlord,
        private_agents_per_landlord,
    ):
        tenant_cursor = 0
        public_agent_cycle = public_agents or []

        for landlord_index, landlord in enumerate(landlords, start=1):
            root_portfolio, _ = Portfolio.objects.update_or_create(
                landlord=landlord,
                name=f"{landlord.display_name} Portfolio",
                defaults={
                    "description": f"Primary property folder for {landlord.display_name}.",
                    "parent": None,
                    "is_archived": False,
                },
            )
            residential_portfolio, _ = Portfolio.objects.update_or_create(
                landlord=landlord,
                name=f"{landlord.display_name} Residential",
                defaults={
                    "description": "Residential property grouping for tenant-facing listings.",
                    "parent": root_portfolio,
                    "is_archived": False,
                },
            )

            private_agents = []
            for agent_index in range(1, private_agents_per_landlord + 1):
                full_name = self.fake.unique.name()
                email = f"privateagent-{landlord_index:03d}-{agent_index:02d}@{self.fake_email_domain}"
                user, _ = User.objects.update_or_create(
                    email=email,
                    defaults={
                        "username": email,
                        "full_name": full_name,
                        "phone_number": self._phone_number(800 + landlord_index * 10 + agent_index),
                        "role": UserRole.AGENT,
                    },
                )
                user.set_password(password)
                user.save(update_fields=["password"])
                agent_profile, _ = AgentProfile.objects.update_or_create(
                    user=user,
                    defaults={
                        "agent_type": AgentType.PRIVATE,
                        "bio": self.fake.sentence(nb_words=12),
                        "created_by_landlord": landlord,
                    },
                )
                private_agents.append(agent_profile)

            for property_index in range(1, properties_per_landlord + 1):
                property_type = self.randomizer.choice(PropertyType.values)
                status_mode = property_index % 4
                if status_mode == 0:
                    status = PropertyStatus.HIDDEN
                    is_public = False
                elif status_mode == 1:
                    status = PropertyStatus.AVAILABLE
                    is_public = True
                elif status_mode == 2:
                    status = PropertyStatus.OCCUPIED
                    is_public = True
                else:
                    status = PropertyStatus.AVAILABLE
                    is_public = False

                city, district = self.randomizer.choice(self.rwanda_cities)
                neighborhood = self.randomizer.choice(self.neighborhoods)
                bedrooms = self.randomizer.randint(1, 5)
                bathrooms = max(1, bedrooms - 1)
                rent_amount = Decimal(str(self.randomizer.randint(180000, 1800000)))
                service_charge = Decimal(str(self.randomizer.choice([0, 10000, 15000, 25000, 40000])))
                title_prefix = self.fake.word().title()
                title = f"{title_prefix} {property_type.replace('_', ' ').title()} {landlord_index}-{property_index}"
                slug_name = slugify(f"{landlord.display_name}-{title}-{property_index}")[:220]

                property_obj = self._create_or_update_property(
                    landlord=landlord,
                    portfolio=residential_portfolio,
                    slug_name=slug_name,
                    title=title,
                    property_type=property_type,
                    status=status,
                    is_public=is_public,
                    is_featured=is_public and property_index == 1,
                    city=city,
                    district=district,
                    neighborhood=neighborhood,
                    latitude=self._latitude(),
                    longitude=self._longitude(),
                    rent_amount=rent_amount,
                    security_deposit=rent_amount,
                    service_charge=service_charge,
                    late_fee_amount=Decimal(str(self.randomizer.choice([5000, 10000, 15000, 25000]))),
                    bedrooms=bedrooms,
                    bathrooms=bathrooms,
                    area_sqm=Decimal(str(self.randomizer.randint(35, 240))),
                    furnished=self.randomizer.choice([True, False]),
                    pets_allowed=self.randomizer.choice([True, False]),
                    short_description=self.fake.sentence(nb_words=10),
                    description=self.fake.paragraph(nb_sentences=4),
                    address_line_1=self.fake.street_address(),
                    utilities_included=self.randomizer.choice(self.utilities_options),
                    house_rules=self.fake.sentence(nb_words=8),
                    nearby_landmarks=self.randomizer.choice(self.landmarks),
                    listed_at=timezone.now() if is_public else None,
                    location_path=self._resolve_location_path(district, neighborhood),
                )
                self._sync_property_images(property_obj, slug_name)

                selected_private_agent = private_agents[(property_index - 1) % len(private_agents)] if private_agents else None
                if selected_private_agent:
                    self._create_or_update_assignment(
                        landlord,
                        selected_private_agent,
                        property_obj,
                        landlord.user,
                    )

                if public_agent_cycle and property_index % 2 == 0:
                    public_agent = public_agent_cycle[(landlord_index + property_index - 2) % len(public_agent_cycle)]
                    self._create_or_update_assignment(
                        landlord,
                        public_agent,
                        property_obj,
                        landlord.user,
                    )

                if status == PropertyStatus.OCCUPIED and tenants:
                    tenant = tenants[tenant_cursor % len(tenants)]
                    tenant_cursor += 1
                    tenancy = self._create_or_update_tenancy(
                        property_obj=property_obj,
                        landlord=landlord,
                        tenant=tenant,
                        assigned_by=landlord.user,
                        status=TenancyStatus.ACTIVE,
                        start_date=timezone.now().date() - timedelta(days=30 * self.randomizer.randint(1, 18)),
                        notes=self.fake.sentence(nb_words=12),
                    )
                    self._seed_payment_history(tenancy)
                    if property_index % 3 == 0:
                        self._create_or_update_complaint(tenancy)

    def _seed_bookmarks(self, tenants):
        public_properties = list(
            Property.objects.filter(
                is_public=True,
                status__in=[PropertyStatus.AVAILABLE, PropertyStatus.OCCUPIED],
            )[:40]
        )
        created_count = 0
        if not public_properties:
            return created_count

        for tenant in tenants:
            sample_size = min(3, len(public_properties))
            for property_obj in self.randomizer.sample(public_properties, k=sample_size):
                _, created = PropertyBookmark.objects.update_or_create(
                    tenant=tenant,
                    property=property_obj,
                )
                if created:
                    created_count += 1
        return created_count

    def _create_or_update_fixed_user(self, key, password):
        user_data = self.demo_users[key]
        user, _ = User.objects.update_or_create(
            email=user_data["email"],
            defaults={
                "username": user_data["email"],
                "full_name": user_data["full_name"],
                "phone_number": user_data["phone_number"],
                "role": user_data["role"],
            },
        )
        user.set_password(password)
        user.save(update_fields=["password"])
        return user

    def _create_or_update_tenant_profile(
        self,
        user,
        document_type,
        document_number,
        document_url,
        issuing_country,
    ):
        tenant_profile, _ = TenantProfile.objects.update_or_create(
            user=user,
            defaults={
                "legal_id_type": document_type,
                "legal_id_number": document_number,
                "legal_id_document_url": document_url,
            },
        )
        TenantLegalDocument.objects.update_or_create(
            tenant=tenant_profile,
            defaults={
                "document_type": document_type,
                "document_number": document_number,
                "document_url": document_url,
                "issuing_country": issuing_country,
                "status": LegalDocumentStatus.VERIFIED,
            },
        )
        return tenant_profile

    def _create_or_update_property(
        self,
        landlord,
        portfolio,
        slug_name,
        title,
        property_type,
        status,
        is_public,
        is_featured,
        city,
        district,
        neighborhood,
        latitude,
        longitude,
        rent_amount,
        security_deposit,
        service_charge,
        late_fee_amount,
        bedrooms,
        bathrooms,
        area_sqm,
        furnished,
        pets_allowed,
        short_description,
        description,
        address_line_1,
        utilities_included,
        house_rules,
        nearby_landmarks,
        listed_at,
        location_path,
    ):
        return Property.objects.update_or_create(
            landlord=landlord,
            name=slug_name,
            defaults={
                "portfolio": portfolio,
                "parent_property": None,
                "title": title,
                "short_description": short_description,
                "description": description,
                "property_type": property_type,
                "status": status,
                "is_public": is_public,
                "is_featured": is_featured,
                "bedrooms": bedrooms,
                "bathrooms": bathrooms,
                "kitchens": 1,
                "living_rooms": 1 if bedrooms < 4 else 2,
                "parking_spaces": self.randomizer.randint(0, 3),
                "area_sqm": area_sqm,
                "furnished": furnished,
                "pets_allowed": pets_allowed,
                "smoking_allowed": False,
                "address_line_1": address_line_1,
                "address_line_2": "",
                "neighborhood": neighborhood,
                "city": city,
                "district": location_path["district"].name,
                "district_area": location_path["district"],
                "sector_area": location_path["sector"],
                "cell_area": location_path["cell"],
                "village_area": location_path["village"],
                "country": "Rwanda",
                "latitude": latitude,
                "longitude": longitude,
                "rent_amount": rent_amount,
                "currency": "RWF",
                "billing_cycle": BillingCycle.MONTHLY,
                "security_deposit": security_deposit,
                "advance_payment_amount": Decimal("0.00"),
                "service_charge": service_charge,
                "late_fee_amount": late_fee_amount,
                "minimum_lease_months": self.randomizer.choice([3, 6, 12]),
                "available_from": timezone.now().date() + timedelta(days=self.randomizer.randint(0, 45)),
                "utilities_included": utilities_included,
                "house_rules": house_rules,
                "nearby_landmarks": nearby_landmarks,
                "listed_at": listed_at,
            },
        )[0]

    def _bootstrap_rwanda_location_hierarchy(self):
        tree = {"districts": {}}
        for district_name, district_data in self.location_blueprint.items():
            district, _ = District.objects.update_or_create(
                code=slugify(district_name).upper().replace("-", "_"),
                defaults={
                    "name": district_name,
                    "center_latitude": Decimal(district_data["center"][0]),
                    "center_longitude": Decimal(district_data["center"][1]),
                },
            )
            tree["districts"][district_name] = {"district": district, "sectors": {}}

            for sector_name, sector_data in district_data["sectors"].items():
                sector, _ = Sector.objects.update_or_create(
                    code=f"{district.code}_{slugify(sector_name).upper().replace('-', '_')}",
                    defaults={
                        "district": district,
                        "name": sector_name,
                        "center_latitude": Decimal(sector_data["center"][0]),
                        "center_longitude": Decimal(sector_data["center"][1]),
                    },
                )
                tree["districts"][district_name]["sectors"][sector_name] = {
                    "sector": sector,
                    "cells": {},
                }

                for cell_name, villages in sector_data["cells"].items():
                    cell, _ = Cell.objects.update_or_create(
                        code=f"{sector.code}_{slugify(cell_name).upper().replace('-', '_')}",
                        defaults={
                            "sector": sector,
                            "name": cell_name,
                            "center_latitude": sector.center_latitude,
                            "center_longitude": sector.center_longitude,
                        },
                    )
                    tree["districts"][district_name]["sectors"][sector_name]["cells"][cell_name] = {
                        "cell": cell,
                        "villages": [],
                    }

                    for village_name in villages:
                        village, _ = Village.objects.update_or_create(
                            code=f"{cell.code}_{slugify(village_name).upper().replace('-', '_')}",
                            defaults={
                                "cell": cell,
                                "name": village_name,
                                "center_latitude": cell.center_latitude,
                                "center_longitude": cell.center_longitude,
                            },
                        )
                        tree["districts"][district_name]["sectors"][sector_name]["cells"][cell_name]["villages"].append(
                            village
                        )
        return tree

    def _resolve_location_path(self, district_name, neighborhood=""):
        district_data = self.location_tree["districts"].get(district_name)
        if not district_data:
            district_name = next(iter(self.location_tree["districts"]))
            district_data = self.location_tree["districts"][district_name]

        preferred_sector = self.neighborhood_sector_preferences.get(neighborhood)
        available_sector_names = list(district_data["sectors"].keys())
        if preferred_sector not in district_data["sectors"]:
            preferred_sector = self.randomizer.choice(available_sector_names)

        sector_data = district_data["sectors"][preferred_sector]
        cell_name = self.randomizer.choice(list(sector_data["cells"].keys()))
        cell_data = sector_data["cells"][cell_name]
        village = self.randomizer.choice(cell_data["villages"])

        return {
            "district": district_data["district"],
            "sector": sector_data["sector"],
            "cell": cell_data["cell"],
            "village": village,
        }

    def _backfill_existing_property_locations(self):
        for property_obj in Property.objects.select_related(
            "district_area",
            "sector_area",
            "cell_area",
            "village_area",
        ):
            if property_obj.village_area_id:
                continue

            location_path = self._resolve_location_path(property_obj.district or "Gasabo", property_obj.neighborhood)
            property_obj.district = location_path["district"].name
            property_obj.district_area = location_path["district"]
            property_obj.sector_area = location_path["sector"]
            property_obj.cell_area = location_path["cell"]
            property_obj.village_area = location_path["village"]
            property_obj.save(
                update_fields=[
                    "district",
                    "district_area",
                    "sector_area",
                    "cell_area",
                    "village_area",
                    "updated_at",
                ]
            )

    def _create_or_update_tenancy(
        self,
        property_obj,
        landlord,
        tenant,
        assigned_by,
        status,
        start_date,
        notes,
    ):
        return Tenancy.objects.update_or_create(
            property=property_obj,
            tenant=tenant,
            defaults={
                "landlord": landlord,
                "assigned_by": assigned_by,
                "status": status,
                "start_date": start_date,
                "end_date": None,
                "move_out_date": None,
                "monthly_rent_snapshot": property_obj.rent_amount,
                "security_deposit_snapshot": property_obj.security_deposit,
                "billing_cycle_snapshot": property_obj.billing_cycle,
                "notes": notes,
            },
        )[0]

    def _create_or_update_payment(
        self,
        tenancy,
        reference,
        category,
        status,
        method,
        amount_due,
        amount_paid,
        notes,
        paid_at=None,
    ):
        Payment.objects.update_or_create(
            tenancy=tenancy,
            reference=reference,
            defaults={
                "category": category,
                "status": status,
                "method": method,
                "amount_due": amount_due,
                "amount_paid": amount_paid,
                "currency": "RWF",
                "due_date": tenancy.start_date + timedelta(days=30),
                "paid_at": paid_at,
                "notes": notes,
            },
        )

    def _seed_payment_history(self, tenancy):
        amount_due = tenancy.monthly_rent_snapshot
        full_paid_reference = f"RENT-{tenancy.property_id}-001"
        partial_reference = f"SERVICE-{tenancy.property_id}-001"
        self._create_or_update_payment(
            tenancy=tenancy,
            reference=full_paid_reference,
            category=PaymentCategory.RENT,
            status=PaymentStatus.PAID,
            method=self.randomizer.choice(PaymentMethod.values),
            amount_due=amount_due,
            amount_paid=amount_due,
            notes="Seeded paid rent entry.",
            paid_at=timezone.now() - timedelta(days=self.randomizer.randint(3, 20)),
        )
        service_due = tenancy.property.service_charge or Decimal("10000.00")
        partial_paid = service_due / Decimal("2")
        self._create_or_update_payment(
            tenancy=tenancy,
            reference=partial_reference,
            category=PaymentCategory.SERVICE_CHARGE,
            status=PaymentStatus.PARTIAL if service_due else PaymentStatus.PAID,
            method=self.randomizer.choice(PaymentMethod.values),
            amount_due=service_due,
            amount_paid=partial_paid if service_due else Decimal("0.00"),
            notes="Seeded partial service charge entry.",
            paid_at=timezone.now() - timedelta(days=self.randomizer.randint(1, 10)) if service_due else None,
        )

    def _create_or_update_complaint(self, tenancy):
        direction = self.randomizer.choice(ComplaintDirection.values)
        if direction == ComplaintDirection.TENANT_TO_LANDLORD:
            created_by = tenancy.tenant.user
            assigned_to = tenancy.landlord.user
        else:
            created_by = tenancy.landlord.user
            assigned_to = tenancy.tenant.user

        Complaint.objects.update_or_create(
            tenancy=tenancy,
            title=f"{tenancy.property.title} issue",
            defaults={
                "created_by": created_by,
                "assigned_to": assigned_to,
                "description": self.fake.paragraph(nb_sentences=3),
                "category": self.randomizer.choice(ComplaintCategory.values),
                "direction": direction,
                "status": self.randomizer.choice(
                    [
                        ComplaintStatus.OPEN,
                        ComplaintStatus.IN_REVIEW,
                        ComplaintStatus.RESOLVED,
                    ]
                ),
            },
        )

    def _create_or_update_assignment(self, landlord, agent, property_obj, granted_by):
        PropertyAgentAssignment.objects.update_or_create(
            landlord=landlord,
            agent=agent,
            property=property_obj,
            defaults={
                "status": AgentAssignmentStatus.ACTIVE,
                "granted_by": granted_by,
                "revoked_at": None,
            },
        )

    def _reset_seeded_users(self):
        demo_emails = [user["email"] for user in self.demo_users.values()]
        User.objects.filter(email__in=demo_emails).delete()
        User.objects.filter(email__endswith=f"@{self.fake_email_domain}").delete()

    def _sync_property_images(self, property_obj, slug_name):
        image_defaults = [
            (f"https://picsum.photos/seed/{slug_name}-cover/1280/860", "Front exterior", True, 1),
            (f"https://picsum.photos/seed/{slug_name}-living/1280/860", "Living room", False, 2),
            (f"https://picsum.photos/seed/{slug_name}-bedroom/1280/860", "Bedroom", False, 3),
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

    def _phone_number(self, index):
        return f"0788{index:06d}"[-10:]

    def _latitude(self):
        return Decimal(f"{self.randomizer.uniform(-1.98, -1.87):.6f}")

    def _longitude(self):
        return Decimal(f"{self.randomizer.uniform(30.01, 30.16):.6f}")
