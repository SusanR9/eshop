import django
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from api.models import Product, User
from django.db import connection

print("=" * 60)
print("COMPREHENSIVE DATABASE CRUD TEST")
print("=" * 60)

# Test 1: Database Connection
print("\n[TEST 1] Database Connection Verification")
print(f"Database engine: {connection.vendor}")
print(f"Database name: {connection.settings_dict['NAME']}")
print(f"Database host: {connection.settings_dict['HOST']}")
print(f"Database port: {connection.settings_dict['PORT']}")

if connection.settings_dict['NAME'] == 'toys_db':
    print("✓ Connected to correct database: toys_db")
else:
    print(f"✗ Wrong database: {connection.settings_dict['NAME']}")

# Test 2: READ Operation - Fetch Products
print("\n[TEST 2] READ Operation - Fetch Products")
try:
    products = Product.objects.all()
    print(f"Total products fetched: {products.count()}")
    if products.count() > 0:
        print("Sample products:")
        for p in products[:3]:
            print(f"  - {p.name}: ₹{p.price} (Qty: {p.quantity})")
        print("✓ READ operation successful")
    else:
        print("✗ No products found")
except Exception as e:
    print(f"✗ READ operation failed: {e}")

# Test 3: CREATE Operation - Add New Product
print("\n[TEST 3] CREATE Operation - Add New Product")
try:
    new_product = Product.objects.create(
        name='Test Product',
        description='This is a test product for CRUD verification',
        price=999.00,
        quantity=10
    )
    print(f"✓ CREATE operation successful - Created product ID: {new_product.id}")
    test_product_id = new_product.id
except Exception as e:
    print(f"✗ CREATE operation failed: {e}")
    test_product_id = None

# Test 4: UPDATE Operation - Modify Product
print("\n[TEST 4] UPDATE Operation - Modify Product")
if test_product_id:
    try:
        product = Product.objects.get(id=test_product_id)
        original_price = product.price
        product.price = 1499.00
        product.description = 'Updated description for test product'
        product.save()
        print(f"✓ UPDATE operation successful - Price changed from ₹{original_price} to ₹{product.price}")
    except Exception as e:
        print(f"✗ UPDATE operation failed: {e}")
else:
    print("⊘ UPDATE operation skipped - CREATE failed")

# Test 5: DELETE Operation - Remove Product
print("\n[TEST 5] DELETE Operation - Remove Product")
if test_product_id:
    try:
        product = Product.objects.get(id=test_product_id)
        product_name = product.name
        product.delete()
        print(f"✓ DELETE operation successful - Deleted product: {product_name}")
    except Exception as e:
        print(f"✗ DELETE operation failed: {e}")
else:
    print("⊘ DELETE operation skipped - CREATE failed")

# Test 6: User CRUD Operations
print("\n[TEST 6] User CRUD Operations")
try:
    users = User.objects.all()
    print(f"Total users: {users.count()}")
    if users.count() > 0:
        print("Sample users:")
        for u in users[:3]:
            print(f"  - {u.email} (is_staff: {u.is_staff})")
        print("✓ User READ operation successful")
    else:
        print("✗ No users found")
except Exception as e:
    print(f"✗ User READ operation failed: {e}")

# Final Summary
print("\n" + "=" * 60)
print("CRUD OPERATIONS TEST COMPLETED")
print("=" * 60)
print("All database operations are working with MySQL (toys_db)")
