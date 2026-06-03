# Recreated stub - original was missing from the repo.
# Adds city, state, pin_code fields to Order to bridge 0001 -> 0004.
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='order',
            name='city',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='state',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
        migrations.AddField(
            model_name='order',
            name='pin_code',
            field=models.CharField(blank=True, max_length=10, null=True),
        ),
    ]
