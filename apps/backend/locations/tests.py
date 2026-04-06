from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import LandlordProfile, User, UserRole
from properties.models import BillingCycle, Property, PropertyStatus, PropertyType


class LocationsApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        landlord_user = User.objects.create_user(
            email="landlord@example.com",
            password="password123",
            role=UserRole.LANDLORD,
            full_name="Landlord One",
        )
        other_landlord_user = User.objects.create_user(
            email="other@example.com",
            password="password123",
            role=UserRole.LANDLORD,
            full_name="Landlord Two",
        )
        self.landlord = LandlordProfile.objects.create(user=landlord_user, display_name="Landlord One")
        self.other_landlord = LandlordProfile.objects.create(
            user=other_landlord_user,
            display_name="Landlord Two",
        )

        self.public_property = Property.objects.create(
            landlord=self.landlord,
            name="green-heights",
            title="Green Heights Apartments",
            short_description="Public listing",
            description="Map-ready public property.",
            property_type=PropertyType.APARTMENT,
            status=PropertyStatus.AVAILABLE,
            is_public=True,
            address_line_1="KG 10 Ave",
            city="Kigali",
            country="Rwanda",
            latitude=-1.944072,
            longitude=30.061885,
            rent_amount=300000,
            currency="RWF",
            billing_cycle=BillingCycle.MONTHLY,
        )
        self.landlord_hidden_property = Property.objects.create(
            landlord=self.landlord,
            name="hidden-home",
            title="Hidden Home",
            short_description="Hidden landlord property",
            description="Landlord-only map property.",
            property_type=PropertyType.HOUSE,
            status=PropertyStatus.HIDDEN,
            is_public=False,
            address_line_1="KG 12 Ave",
            city="Kigali",
            country="Rwanda",
            latitude=-1.942000,
            longitude=30.058000,
            rent_amount=450000,
            currency="RWF",
            billing_cycle=BillingCycle.MONTHLY,
        )
        self.other_public_property = Property.objects.create(
            landlord=self.other_landlord,
            name="far-house",
            title="Far House",
            short_description="Another public property",
            description="Farther away public property.",
            property_type=PropertyType.HOUSE,
            status=PropertyStatus.AVAILABLE,
            is_public=True,
            address_line_1="Remera",
            city="Kigali",
            country="Rwanda",
            latitude=-1.900000,
            longitude=30.120000,
            rent_amount=700000,
            currency="RWF",
            billing_cycle=BillingCycle.MONTHLY,
        )
        Property.objects.create(
            landlord=self.landlord,
            name="no-coords",
            title="No Coordinates",
            short_description="No map coordinates",
            description="Should not show on map.",
            property_type=PropertyType.STUDIO,
            status=PropertyStatus.AVAILABLE,
            is_public=True,
            address_line_1="KG 15 Ave",
            city="Kigali",
            rent_amount=250000,
            currency="RWF",
            billing_cycle=BillingCycle.MONTHLY,
        )

    def test_public_map_returns_only_public_properties_with_coordinates(self):
        response = self.client.get("/api/v1/locations/public-map/")

        self.assertEqual(response.status_code, 200)
        titles = {item["title"] for item in response.data}
        self.assertIn(self.public_property.title, titles)
        self.assertIn(self.other_public_property.title, titles)
        self.assertNotIn(self.landlord_hidden_property.title, titles)
        self.assertNotIn("No Coordinates", titles)

    def test_public_map_can_filter_by_radius_from_user_location(self):
        response = self.client.get(
            "/api/v1/locations/public-map/?latitude=-1.944072&longitude=30.061885&radius_km=1"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], self.public_property.title)
        self.assertIsNotNone(response.data[0]["distance_km"])

    def test_landlord_map_returns_summary_for_landlord_properties(self):
        response = self.client.get(f"/api/v1/locations/landlord-map/?landlord={self.landlord.id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["landlord"], self.landlord.id)
        self.assertEqual(response.data["total_properties"], 2)
        self.assertEqual(response.data["available_properties"], 1)
        self.assertEqual(response.data["hidden_properties"], 1)
        titles = {item["title"] for item in response.data["map_points"]}
        self.assertIn(self.public_property.title, titles)
        self.assertIn(self.landlord_hidden_property.title, titles)
        self.assertNotIn(self.other_public_property.title, titles)

    def test_landlord_map_requires_landlord_identifier(self):
        response = self.client.get("/api/v1/locations/landlord-map/")

        self.assertEqual(response.status_code, 400)

    def test_public_map_can_filter_by_bounding_box(self):
        response = self.client.get(
            "/api/v1/locations/public-map/?north=-1.93&south=-1.95&east=30.07&west=30.05"
        )

        self.assertEqual(response.status_code, 200)
        titles = {item["title"] for item in response.data}
        self.assertIn(self.public_property.title, titles)
        self.assertNotIn(self.other_public_property.title, titles)
