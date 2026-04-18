from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("history", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="tenanthistorylookup",
            name="tenant_identifier",
            field=models.CharField(max_length=64),
        ),
    ]
