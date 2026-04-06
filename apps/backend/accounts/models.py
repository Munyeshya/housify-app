import uuid

from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.exceptions import ObjectDoesNotExist
from django.db import models


class UserRole(models.TextChoices):
    LANDLORD = "landlord", "Landlord"
    TENANT = "tenant", "Tenant"
    AGENT = "agent", "Agent"
    ADMIN = "admin", "Admin"


class AgentType(models.TextChoices):
    PRIVATE = "private", "Private"
    PUBLIC = "public", "Public"


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError("The given email must be set")

        email = self.normalize_email(email)
        user = self.model(email=email, username=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", UserRole.ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = models.CharField(max_length=150, blank=True)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=30, blank=True)
    role = models.CharField(max_length=20, choices=UserRole.choices)
    full_name = models.CharField(max_length=255)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    objects = UserManager()

    def __str__(self):
        return self.full_name or self.email


class LandlordProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="landlord_profile")
    display_name = models.CharField(max_length=255)

    def __str__(self):
        return self.display_name


class TenantProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="tenant_profile")
    tenant_identifier = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    legal_id_type = models.CharField(max_length=100, blank=True)
    legal_id_number = models.CharField(max_length=100, blank=True)
    legal_id_document_url = models.URLField(blank=True)

    @property
    def has_legal_id_document(self):
        if self.legal_id_document_url:
            return True

        try:
            return bool(self.legal_document.document_url)
        except ObjectDoesNotExist:
            return False

    def __str__(self):
        return f"Tenant {self.user.full_name}"


class AgentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="agent_profile")
    agent_type = models.CharField(max_length=20, choices=AgentType.choices, default=AgentType.PUBLIC)
    created_by_landlord = models.ForeignKey(
        LandlordProfile,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="private_agents",
    )
    bio = models.TextField(blank=True)

    def __str__(self):
        return f"Agent {self.user.full_name}"
