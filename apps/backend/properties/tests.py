from django.test import TestCase
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from accounts.models import LandlordProfile, User, UserRole

from .models import BillingCycle, Portfolio, Property, PropertyImage, PropertyStatus, PropertyType


class LandlordPropertyManagementApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.landlord_user = User.objects.create_user(
            email="landlord@example.com",
            password="password123",
            role=UserRole.LANDLORD,
            full_name="Landlord One",
        )
        self.other_landlord_user = User.objects.create_user(
            email="other@example.com",
            password="password123",
            role=UserRole.LANDLORD,
            full_name="Landlord Two",
        )
        self.landlord = LandlordProfile.objects.create(user=self.landlord_user, display_name="Landlord One")
        self.other_landlord = LandlordProfile.objects.create(
            user=self.other_landlord_user,
            display_name="Landlord Two",
        )
        self.portfolio = Portfolio.objects.create(landlord=self.landlord, name="Main Portfolio")
        self.property = Property.objects.create(
            landlord=self.landlord,
            portfolio=self.portfolio,
            name="green-heights",
            title="Green Heights Apartments",
            short_description="Managed listing",
            description="A managed property.",
            property_type=PropertyType.APARTMENT,
            status=PropertyStatus.DRAFT,
            address_line_1="KG 10 Ave",
            city="Kigali",
            latitude=-1.944072,
            longitude=30.061885,
            rent_amount=300000,
            currency="RWF",
            billing_cycle=BillingCycle.MONTHLY,
        )

    def test_landlord_can_create_portfolio(self):
        self.client.force_authenticate(user=self.landlord_user)

        response = self.client.post(
            "/api/v1/properties/portfolios/",
            {
                "name": "Sub Portfolio",
                "description": "Nested group",
                "parent": self.portfolio.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

    def test_landlord_can_create_property(self):
        self.client.force_authenticate(user=self.landlord_user)

        response = self.client.post(
            "/api/v1/properties/manage/",
            {
                "portfolio": self.portfolio.id,
                "name": "new-home",
                "title": "New Home",
                "short_description": "Fresh listing",
                "description": "Another managed property.",
                "property_type": PropertyType.HOUSE,
                "status": PropertyStatus.DRAFT,
                "is_public": False,
                "is_featured": False,
                "bedrooms": 3,
                "bathrooms": 2,
                "kitchens": 1,
                "living_rooms": 1,
                "parking_spaces": 1,
                "furnished": False,
                "pets_allowed": True,
                "smoking_allowed": False,
                "address_line_1": "KG 20 Ave",
                "address_line_2": "",
                "neighborhood": "Kacyiru",
                "city": "Kigali",
                "district": "",
                "country": "Rwanda",
                "latitude": -1.95,
                "longitude": 30.06,
                "rent_amount": 500000,
                "currency": "RWF",
                "billing_cycle": BillingCycle.MONTHLY,
                "security_deposit": 500000,
                "advance_payment_amount": 0,
                "service_charge": 0,
                "late_fee_amount": 0,
                "minimum_lease_months": 1,
                "utilities_included": "",
                "house_rules": "",
                "nearby_landmarks": "",
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)

    def test_landlord_can_publish_property(self):
        self.client.force_authenticate(user=self.landlord_user)

        response = self.client.post(f"/api/v1/properties/manage/{self.property.id}/publish/")

        self.assertEqual(response.status_code, 200)
        self.property.refresh_from_db()
        self.assertTrue(self.property.is_public)
        self.assertEqual(self.property.status, PropertyStatus.AVAILABLE)

    def test_landlord_can_manage_property_images(self):
        self.client.force_authenticate(user=self.landlord_user)

        create_response = self.client.post(
            f"/api/v1/properties/manage/{self.property.id}/images/",
            {
                "image_url": "https://example.com/image.jpg",
                "caption": "Front view",
                "is_cover": True,
                "sort_order": 1,
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, 201)
        image_id = create_response.data["id"]

        patch_response = self.client.patch(
            f"/api/v1/properties/images/{image_id}/",
            {
                "caption": "Updated front view",
            },
            format="json",
        )

        self.assertEqual(patch_response.status_code, 200)
        self.assertEqual(PropertyImage.objects.get(id=image_id).caption, "Updated front view")

    def test_landlord_can_upload_property_image_file(self):
        self.client.force_authenticate(user=self.landlord_user)
        uploaded_file = SimpleUploadedFile(
            "property-front.jpg",
            b"fake property image bytes",
            content_type="image/jpeg",
        )

        response = self.client.post(
            f"/api/v1/properties/manage/{self.property.id}/images/",
            {
                "image_file": uploaded_file,
                "caption": "Uploaded front view",
                "is_cover": True,
                "sort_order": 1,
            },
            format="multipart",
        )

        image = PropertyImage.objects.get(property=self.property, caption="Uploaded front view")

        self.assertEqual(response.status_code, 201)
        self.assertTrue(bool(image.image_file))
        self.assertTrue(response.data["has_uploaded_file"])
        self.assertIn("/media/property-images/", response.data["image_url"])

    def test_landlord_only_sees_own_managed_properties(self):
        Property.objects.create(
            landlord=self.other_landlord,
            name="other-home",
            title="Other Home",
            short_description="Other listing",
            description="Another landlord property.",
            property_type=PropertyType.HOUSE,
            status=PropertyStatus.AVAILABLE,
            address_line_1="KG 30 Ave",
            city="Kigali",
            latitude=-1.90,
            longitude=30.10,
            rent_amount=900000,
            currency="RWF",
            billing_cycle=BillingCycle.MONTHLY,
        )
        self.client.force_authenticate(user=self.landlord_user)

        response = self.client.get("/api/v1/properties/manage/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data["results"]), 1)
