import uuid
import builtins

from django.core.exceptions import ValidationError
from django.db import models

from accounts.models import LandlordProfile
from locations.models import Cell, District, Sector, Village


class PropertyType(models.TextChoices):
    APARTMENT = "apartment", "Apartment"
    HOUSE = "house", "House"
    COMPOUND = "compound", "Compound"
    STUDIO = "studio", "Studio"
    ROOM = "room", "Room"
    COMMERCIAL = "commercial", "Commercial"
    OTHER = "other", "Other"


class PropertyStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    AVAILABLE = "available", "Available"
    OCCUPIED = "occupied", "Occupied"
    HIDDEN = "hidden", "Hidden"
    ARCHIVED = "archived", "Archived"
    MAINTENANCE = "maintenance", "Under maintenance"


class BillingCycle(models.TextChoices):
    MONTHLY = "monthly", "Monthly"
    WEEKLY = "weekly", "Weekly"
    YEARLY = "yearly", "Yearly"
    CUSTOM = "custom", "Custom"


class Portfolio(models.Model):
    landlord = models.ForeignKey(
        LandlordProfile,
        on_delete=models.CASCADE,
        related_name="portfolios",
    )
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_archived = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("name",)

    def __str__(self):
        return self.name


class Property(models.Model):
    landlord = models.ForeignKey(
        LandlordProfile,
        on_delete=models.CASCADE,
        related_name="properties",
    )
    portfolio = models.ForeignKey(
        Portfolio,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="properties",
    )
    parent_property = models.ForeignKey(
        "self",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="sub_properties",
    )
    property_reference = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    short_description = models.CharField(max_length=280, blank=True)
    description = models.TextField()
    property_type = models.CharField(max_length=30, choices=PropertyType.choices)
    status = models.CharField(
        max_length=30,
        choices=PropertyStatus.choices,
        default=PropertyStatus.DRAFT,
    )
    is_public = models.BooleanField(default=False)
    is_featured = models.BooleanField(default=False)
    bedrooms = models.PositiveIntegerField(default=0)
    bathrooms = models.PositiveIntegerField(default=0)
    kitchens = models.PositiveIntegerField(default=0)
    living_rooms = models.PositiveIntegerField(default=0)
    parking_spaces = models.PositiveIntegerField(default=0)
    area_sqm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    furnished = models.BooleanField(default=False)
    pets_allowed = models.BooleanField(default=False)
    smoking_allowed = models.BooleanField(default=False)
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True)
    neighborhood = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=255)
    district = models.CharField(max_length=255, blank=True)
    district_area = models.ForeignKey(
        District,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="properties",
    )
    sector_area = models.ForeignKey(
        Sector,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="properties",
    )
    cell_area = models.ForeignKey(
        Cell,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="properties",
    )
    village_area = models.ForeignKey(
        Village,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="properties",
    )
    country = models.CharField(max_length=255, default="Rwanda")
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    rent_amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10, default="RWF")
    billing_cycle = models.CharField(
        max_length=20,
        choices=BillingCycle.choices,
        default=BillingCycle.MONTHLY,
    )
    security_deposit = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    advance_payment_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    service_charge = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    late_fee_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    minimum_lease_months = models.PositiveIntegerField(default=1)
    available_from = models.DateField(null=True, blank=True)
    utilities_included = models.TextField(blank=True)
    house_rules = models.TextField(blank=True)
    nearby_landmarks = models.TextField(blank=True)
    listed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.title


class PropertyImage(models.Model):
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name="images",
    )
    image_url = models.URLField(blank=True)
    image_file = models.FileField(
        upload_to="property-images/%Y/%m/%d/",
        blank=True,
        null=True,
    )
    caption = models.CharField(max_length=255, blank=True)
    is_cover = models.BooleanField(default=False)
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ("sort_order", "id")

    def clean(self):
        if not self.image_url and not self.image_file:
            raise ValidationError("Provide either an image URL or an uploaded image file.")

    @builtins.property
    def image_reference(self):
        if self.image_file:
            try:
                return self.image_file.url
            except ValueError:
                return self.image_file.name
        return self.image_url

    def save(self, *args, **kwargs):
        self.full_clean()
        return super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        file_field = self.image_file
        result = super().delete(*args, **kwargs)
        if file_field:
            file_field.delete(save=False)
        return result

    def __str__(self):
        return self.caption or self.image_reference
