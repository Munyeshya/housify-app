from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("properties", "0002_property_location_hierarchy"),
    ]

    operations = [
        migrations.AlterField(
            model_name="propertyimage",
            name="image_url",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="propertyimage",
            name="image_file",
            field=models.FileField(blank=True, null=True, upload_to="property-images/%Y/%m/%d/"),
        ),
    ]
