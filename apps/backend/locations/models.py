from django.db import models


class AdministrativeAreaBase(models.Model):
    code = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=255)
    center_latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    center_longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        abstract = True
        ordering = ("name",)

    def __str__(self):
        return self.name


class District(AdministrativeAreaBase):
    class Meta(AdministrativeAreaBase.Meta):
        verbose_name = "District"
        verbose_name_plural = "Districts"


class Sector(AdministrativeAreaBase):
    district = models.ForeignKey(
        District,
        on_delete=models.CASCADE,
        related_name="sectors",
    )

    class Meta(AdministrativeAreaBase.Meta):
        verbose_name = "Sector"
        verbose_name_plural = "Sectors"
        constraints = [
            models.UniqueConstraint(fields=("district", "name"), name="unique_sector_name_per_district"),
        ]


class Cell(AdministrativeAreaBase):
    sector = models.ForeignKey(
        Sector,
        on_delete=models.CASCADE,
        related_name="cells",
    )

    class Meta(AdministrativeAreaBase.Meta):
        verbose_name = "Cell"
        verbose_name_plural = "Cells"
        constraints = [
            models.UniqueConstraint(fields=("sector", "name"), name="unique_cell_name_per_sector"),
        ]


class Village(AdministrativeAreaBase):
    cell = models.ForeignKey(
        Cell,
        on_delete=models.CASCADE,
        related_name="villages",
    )

    class Meta(AdministrativeAreaBase.Meta):
        verbose_name = "Village"
        verbose_name_plural = "Villages"
        constraints = [
            models.UniqueConstraint(fields=("cell", "name"), name="unique_village_name_per_cell"),
        ]
