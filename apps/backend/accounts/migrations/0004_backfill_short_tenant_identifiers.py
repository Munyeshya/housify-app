from django.db import migrations, models
from django.utils.crypto import get_random_string


TENANT_IDENTIFIER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def build_identifier(used_values):
    for _ in range(64):
        candidate = f"TNT-{get_random_string(6, allowed_chars=TENANT_IDENTIFIER_ALPHABET)}"
        if candidate not in used_values:
            used_values.add(candidate)
            return candidate
    raise RuntimeError("Could not generate a unique tenant identifier during migration.")


def migrate_tenant_identifiers(apps, schema_editor):
    TenantProfile = apps.get_model("accounts", "TenantProfile")
    TenantHistoryLookup = apps.get_model("history", "TenantHistoryLookup")

    used_values = set(
        value
        for value in TenantProfile.objects.values_list("tenant_identifier", flat=True)
        if value and str(value).startswith("TNT-")
    )
    tenant_identifier_map = {}

    for tenant in TenantProfile.objects.order_by("pk"):
        new_identifier = build_identifier(used_values)
        tenant.tenant_identifier = new_identifier
        tenant.save(update_fields=["tenant_identifier"])
        tenant_identifier_map[tenant.pk] = new_identifier

    for lookup in TenantHistoryLookup.objects.order_by("pk"):
        new_identifier = tenant_identifier_map.get(lookup.tenant_id)
        if new_identifier:
            lookup.tenant_identifier = new_identifier
            lookup.save(update_fields=["tenant_identifier"])


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0003_alter_tenantprofile_tenant_identifier"),
        ("history", "0002_alter_tenanthistorylookup_tenant_identifier"),
    ]

    operations = [
        migrations.RunPython(migrate_tenant_identifiers, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="tenantprofile",
            name="tenant_identifier",
            field=models.CharField(blank=True, editable=False, max_length=10, unique=True),
        ),
    ]
