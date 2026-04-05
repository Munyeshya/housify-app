from django.core.exceptions import ValidationError
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import LandlordProfile, TenantProfile, User, UserRole
from properties.models import BillingCycle, Property, PropertyStatus, PropertyType

from .models import PropertyBookmark


class BookmarkApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        landlord_user = User.objects.create_user(
            email="landlord@example.com",
            password="password123",
            role=UserRole.LANDLORD,
            full_name="Landlord One",
        )
        tenant_user = User.objects.create_user(
            email="tenant@example.com",
            password="password123",
            role=UserRole.TENANT,
            full_name="Tenant One",
        )
        self.landlord = LandlordProfile.objects.create(user=landlord_user, display_name="Landlord One")
        self.tenant = TenantProfile.objects.create(user=tenant_user)

        self.public_property = Property.objects.create(
            landlord=self.landlord,
            name="green-heights",
            title="Green Heights Apartments",
            short_description="Public listing",
            description="A visible property for public discovery.",
            property_type=PropertyType.APARTMENT,
            status=PropertyStatus.AVAILABLE,
            is_public=True,
            address_line_1="KG 10 Ave",
            city="Kigali",
            rent_amount=300000,
            currency="RWF",
            billing_cycle=BillingCycle.MONTHLY,
        )
        self.private_property = Property.objects.create(
            landlord=self.landlord,
            name="private-villa",
            title="Private Villa",
            short_description="Private listing",
            description="Hidden from the public marketplace.",
            property_type=PropertyType.HOUSE,
            status=PropertyStatus.AVAILABLE,
            is_public=False,
            address_line_1="KG 20 Ave",
            city="Kigali",
            rent_amount=800000,
            currency="RWF",
            billing_cycle=BillingCycle.MONTHLY,
        )

    def test_tenant_can_bookmark_public_property(self):
        response = self.client.post(
            "/api/v1/bookmarks/",
            {
                "tenant": self.tenant.id,
                "property": self.public_property.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(PropertyBookmark.objects.count(), 1)

    def test_cannot_bookmark_private_property(self):
        response = self.client.post(
            "/api/v1/bookmarks/",
            {
                "tenant": self.tenant.id,
                "property": self.private_property.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(PropertyBookmark.objects.count(), 0)

    def test_duplicate_bookmark_is_blocked(self):
        PropertyBookmark.objects.create(tenant=self.tenant, property=self.public_property)

        response = self.client.post(
            "/api/v1/bookmarks/",
            {
                "tenant": self.tenant.id,
                "property": self.public_property.id,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)

    def test_tenant_can_list_bookmarks(self):
        PropertyBookmark.objects.create(tenant=self.tenant, property=self.public_property)

        response = self.client.get(f"/api/v1/bookmarks/?tenant={self.tenant.id}")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["property"]["title"], self.public_property.title)

    def test_tenant_can_delete_own_bookmark(self):
        bookmark = PropertyBookmark.objects.create(tenant=self.tenant, property=self.public_property)

        response = self.client.delete(f"/api/v1/bookmarks/{bookmark.id}/?tenant={self.tenant.id}")

        self.assertEqual(response.status_code, 204)
        self.assertFalse(PropertyBookmark.objects.filter(id=bookmark.id).exists())

    def test_model_blocks_private_property_bookmark(self):
        with self.assertRaises(ValidationError):
            PropertyBookmark.objects.create(tenant=self.tenant, property=self.private_property)
