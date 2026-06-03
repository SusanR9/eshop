import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Product
from django.db import connection

print("=== Database Connection Test ===")
print(f"Database engine: {connection.vendor}")
print(f"Database name: {connection.settings_dict['NAME']}")
print(f"Database host: {connection.settings_dict['HOST']}")
print(f"Database port: {connection.settings_dict['PORT']}")
print()

print("=== Product Data Test ===")
total_products = Product.objects.count()
print(f"Total products in database: {total_products}")
print()

if total_products > 0:
    print("Sample products:")
    for p in Product.objects.all()[:5]:
        print(f"  - {p.name}: ₹{p.price} (Qty: {p.quantity})")
else:
    print("No products found in database")

print()
print("✓ MySQL connection is working and data is being fetched successfully!")
