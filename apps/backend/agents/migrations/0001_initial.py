from django.db import migrations, models
from django.db.models import Q
import django.db.models.deletion
from django.conf import settings


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ("accounts", "0001_initial"),
        ("properties", "0001_initial"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="PropertyAgentAssignment",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "status",
                    models.CharField(
                        choices=[("active", "Active"), ("revoked", "Revoked"), ("pending", "Pending")],
                        default="active",
                        max_length=20,
                    ),
                ),
                ("granted_at", models.DateTimeField(auto_now_add=True)),
                ("revoked_at", models.DateTimeField(blank=True, null=True)),
                (
                    "agent",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="property_assignments",
                        to="accounts.agentprofile",
                    ),
                ),
                (
                    "granted_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="granted_agent_assignments",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "landlord",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="agent_assignments",
                        to="accounts.landlordprofile",
                    ),
                ),
                (
                    "property",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="agent_assignments",
                        to="properties.property",
                    ),
                ),
            ],
            options={
                "ordering": ("-granted_at",),
                "constraints": [
                    models.UniqueConstraint(
                        condition=Q(("status", "active")),
                        fields=("agent", "property"),
                        name="unique_active_agent_assignment_per_property",
                    )
                ],
            },
        ),
    ]
