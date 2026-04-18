from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("documents", "0002_landlorddocumentverificationaccess"),
    ]

    operations = [
        migrations.AlterField(
            model_name="tenantlegaldocument",
            name="document_url",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="tenantlegaldocument",
            name="document_file",
            field=models.FileField(
                blank=True,
                null=True,
                upload_to="legal-documents/%Y/%m/%d/",
            ),
        ),
    ]
