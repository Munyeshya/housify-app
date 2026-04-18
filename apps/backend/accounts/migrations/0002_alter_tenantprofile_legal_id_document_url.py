from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="tenantprofile",
            name="legal_id_document_url",
            field=models.CharField(blank=True, max_length=500),
        ),
    ]
