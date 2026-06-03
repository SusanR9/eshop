from django.db import models
from django.contrib.auth.hashers import make_password, check_password as django_check_password
from django.utils.translation import gettext_lazy as _


class UserManager(models.Manager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user


class User(models.Model):
    """Maps to the existing `users` table (managed=False)."""
    id = models.AutoField(primary_key=True, db_column="user_id")
    name = models.CharField(max_length=100, db_column="name", blank=True)
    email = models.EmailField(_("email address"), unique=True, db_column="email")
    password = models.CharField(max_length=255, db_column="password")
    created_at = models.DateTimeField(db_column="created_at", blank=True, null=True)
    is_staff = models.BooleanField(default=False, db_column="is_staff")

    objects = UserManager()

    @property
    def is_active(self): return True
    @property
    def is_anonymous(self): return False
    @property
    def is_authenticated(self): return True

    def set_password(self, raw_password):
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        return django_check_password(raw_password, self.password)

    def has_perm(self, perm, obj=None): return self.is_staff
    def has_module_perms(self, app_label): return self.is_staff

    class Meta:
        db_table = "users"
        managed = False

    def __str__(self):
        return self.email


class AdminLogin(models.Model):
    """Maps to the existing `admin_login` table (managed=False, plain-text passwords)."""
    id = models.AutoField(primary_key=True, db_column="admin_id")
    mail_id = models.EmailField(unique=True, db_column="mail_id")
    password = models.CharField(max_length=255, db_column="password")

    class Meta:
        db_table = "admin_login"
        managed = False

    def __str__(self):
        return self.mail_id


class Product(models.Model):
    id = models.AutoField(primary_key=True, db_column="prod_id")
    name = models.CharField(max_length=200, db_column="prod_name")
    description = models.TextField(blank=True, null=True, db_column="description")
    price = models.DecimalField(max_digits=10, decimal_places=2, db_column="price")
    quantity = models.IntegerField(db_column="quantity")
    image = models.CharField(max_length=500, blank=True, null=True, db_column="image")

    class Meta:
        db_table = "products"
        managed = False
        ordering = ["name"]

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_CHOICES = (
        ("Pending", "Pending"),
        ("Packed", "Packed"),
        ("Shipped", "Shipped"),
        ("Out for Delivery", "Out for Delivery"),
        ("Delivered", "Delivered"),
        ("Cancelled", "Cancelled"),
    )
    id = models.AutoField(primary_key=True, db_column="order_id")
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column="user_id", related_name="orders")
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, db_column="total_amount")
    address = models.CharField(max_length=255, db_column="address")
    city = models.CharField(max_length=100, db_column="city", blank=True, null=True)
    state = models.CharField(max_length=100, db_column="state", blank=True, null=True)
    pin_code = models.CharField(max_length=10, db_column="pin_code", blank=True, null=True)
    mobile = models.CharField(max_length=20, db_column="mobile", blank=True, null=True)
    payment_mode = models.CharField(max_length=50, db_column="payment_mode", blank=True, null=True)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default="Pending", db_column="status")
    razorpay_order_id = models.CharField(max_length=255, blank=True, null=True, db_column="razorpay_order_id")
    razorpay_payment_id = models.CharField(max_length=255, blank=True, null=True, db_column="razorpay_payment_id")
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True, db_column="razorpay_signature")
    created_at = models.DateTimeField(db_column="order_datetime", auto_now_add=True, blank=True, null=True)

    class Meta:
        db_table = "orders"
        managed = False

    def __str__(self):
        return f"Order {self.id}"


class OrderItem(models.Model):
    id = models.AutoField(primary_key=True, db_column="order_item_id")
    order = models.ForeignKey(Order, on_delete=models.CASCADE, db_column="order_id", related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, db_column="product_id", null=True, blank=True)
    product_name = models.CharField(max_length=255, db_column="product_name", blank=True, null=True)
    quantity = models.IntegerField(db_column="quantity")
    price = models.DecimalField(max_digits=10, decimal_places=2, db_column="price")

    class Meta:
        db_table = "order_items"
        managed = False

    def __str__(self):
        return f"{self.quantity} x {self.product_name or 'product'} in Order {self.order.id}"
