from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0002_alter_tenantprofile_legal_id_document_url"),
    ]

    operations = [
        migrations.AlterField(
            model_name="tenantprofile",
            name="tenant_identifier",
            field=models.CharField(blank=True, editable=False, max_length=64, unique=True),
        ),
    ]
