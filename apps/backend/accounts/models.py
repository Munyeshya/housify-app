from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.core.exceptions import ObjectDoesNotExist
from django.db import models
from django.utils.crypto import get_random_string


class UserRole(models.TextChoices):
    LANDLORD = "landlord", "Landlord"
    TENANT = "tenant", "Tenant"
    AGENT = "agent", "Agent"
    ADMIN = "admin", "Admin"


class AgentType(models.TextChoices):
    PRIVATE = "private", "Private"
    PUBLIC = "public", "Public"


TENANT_IDENTIFIER_PREFIX = "TNT"
TENANT_IDENTIFIER_LENGTH = 6
TENANT_IDENTIFIER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def generate_tenant_identifier():
    suffix = get_random_string(TENANT_IDENTIFIER_LENGTH, allowed_chars=TENANT_IDENTIFIER_ALPHABET)
    return f"{TENANT_IDENTIFIER_PREFIX}-{suffix}"


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
    tenant_identifier = models.CharField(max_length=10, unique=True, editable=False, blank=True)
    legal_id_type = models.CharField(max_length=100, blank=True)
    legal_id_number = models.CharField(max_length=100, blank=True)
    legal_id_document_url = models.CharField(max_length=500, blank=True)

    @classmethod
    def generate_unique_tenant_identifier(cls):
        for _ in range(32):
            candidate = generate_tenant_identifier()
            if not cls.objects.filter(tenant_identifier=candidate).exists():
                return candidate
        raise RuntimeError("Could not generate a unique tenant identifier.")

    def rotate_tenant_identifier(self, *, save=True):
        self.tenant_identifier = self.generate_unique_tenant_identifier()
        if save:
            self.save(update_fields=["tenant_identifier"])
        return self.tenant_identifier

    def save(self, *args, **kwargs):
        if not self.tenant_identifier:
            self.tenant_identifier = self.generate_unique_tenant_identifier()
        super().save(*args, **kwargs)

    @property
    def has_legal_id_document(self):
        if self.legal_id_document_url:
            return True

        try:
            return bool(self.legal_document.document_reference)
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
