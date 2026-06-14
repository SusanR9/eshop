from rest_framework import status, generics, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, AdminLogin, Product, Order, OrderItem
from .serializers import UserSerializer, ProductSerializer, OrderSerializer
import razorpay
from decimal import Decimal
import os
from django.conf import settings


def get_tokens_for_user(user_id, email, is_admin=False):
    """Generate JWT tokens — works for both User and AdminLogin."""
    refresh = RefreshToken()
    refresh["user_id"] = user_id
    refresh["email"] = email
    refresh["is_staff"] = is_admin
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and not request.user.is_anonymous
            and request.user.is_staff
        )


class IsAuthenticated(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(
            request.user
            and not request.user.is_anonymous
            and request.user.is_authenticated
        )


def get_user_from_request(request):
    """Return the User model instance for regular (non-admin) users."""
    user = getattr(request, 'user', None)
    if user is None or user.is_anonymous:
        return None
    try:
        uid = int(user.id)
    except (TypeError, ValueError):
        return None
    try:
        return User.objects.get(id=uid)
    except User.DoesNotExist:
        return None


def save_uploaded_image(image_file):
    upload_dir = os.path.join(settings.MEDIA_ROOT, "products")
    os.makedirs(upload_dir, exist_ok=True)
    filename = image_file.name.replace(" ", "_")
    filepath = os.path.join(upload_dir, filename)
    with open(filepath, "wb+") as dest:
        for chunk in image_file.chunks():
            dest.write(chunk)
    return f"{settings.MEDIA_URL}products/{filename}"


# ── Auth ──────────────────────────────────────────────────────────────────────

class SignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user.id, user.email, is_admin=False)
            return Response({**tokens, "user": UserSerializer(user).data},
                            status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    """Regular user login — checks the `users` table."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                tokens = get_tokens_for_user(user.id, user.email, is_admin=bool(user.is_staff))
                return Response({
                    **tokens,
                    "user": UserSerializer(user).data,
                    "isAdmin": bool(user.is_staff),
                })
            return Response({"detail": "Invalid credentials"},
                            status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({"detail": "Invalid credentials"},
                            status=status.HTTP_401_UNAUTHORIZED)


class AdminLoginView(APIView):
    """Admin login — checks the `admin_login` table (plain-text passwords)."""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()
        password = request.data.get("password", "").strip()

        try:
            admin = AdminLogin.objects.get(mail_id=email)
        except AdminLogin.DoesNotExist:
            return Response({"detail": "Invalid admin credentials"},
                            status=status.HTTP_401_UNAUTHORIZED)

        # Passwords stored as plain text in admin_login table
        if admin.password != password:
            return Response({"detail": "Invalid admin credentials"},
                            status=status.HTTP_401_UNAUTHORIZED)

        # Store numeric id in token — SimpleJWT requires an integer user_id
        tokens = get_tokens_for_user(
            user_id=admin.id,
            email=admin.mail_id,
            is_admin=True,
        )
        return Response({
            **tokens,
            "isAdmin": True,
            "email": admin.mail_id,
        })


# ── Products ──────────────────────────────────────────────────────────────────

class ProductListView(generics.ListAPIView):
    queryset = Product.objects.all().order_by("name")
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "description"]


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [permissions.AllowAny]


# ── Orders ────────────────────────────────────────────────────────────────────

class OrderCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        items_data = request.data.get("items", [])
        if not items_data:
            return Response({"detail": "No items provided"},
                            status=status.HTTP_400_BAD_REQUEST)
        user = get_user_from_request(request)
        if not user:
            return Response({"detail": "Unauthorized"},
                            status=status.HTTP_401_UNAUTHORIZED)

        address = request.data.get("address")
        city = request.data.get("city")
        state = request.data.get("state")
        pin_code = request.data.get("pin_code")
        mobile = request.data.get("mobile")
        payment_mode = request.data.get("payment_mode")

        if not all([address, city, state, pin_code, mobile]):
            return Response({"detail": "All delivery details are required."},
                            status=status.HTTP_400_BAD_REQUEST)

        total_amount = Decimal("0.00")
        for item in items_data:
            total_amount += Decimal(str(item.get("price", 0))) * int(item.get("quantity", 1))

        order = Order.objects.create(
            user=user,
            total_amount=total_amount,
            address=address,
            city=city,
            state=state,
            pin_code=pin_code,
            mobile=mobile,
            payment_mode=payment_mode,
        )

        for item in items_data:
            try:
                product = Product.objects.get(id=item.get("id"))
            except Product.DoesNotExist:
                product = None
            OrderItem.objects.create(
                order=order, product=product,
                product_name=item.get("name"),
                price=item.get("price"),
                quantity=item.get("quantity"),
            )

        if payment_mode == "razorpay":
            try:
                client = razorpay.Client(auth=(
                    os.environ.get("RAZORPAY_KEY_ID", "rzp_test_SlyeZSQVRS6kuk"),
                    os.environ.get("RAZORPAY_KEY_SECRET", "Qt1G3eLwSAFA8l5bHEHm69ct"),
                ))
                payment = client.order.create({
                    "amount": int(total_amount * 100),
                    "currency": "INR",
                    "payment_capture": "1",
                })
                order.razorpay_order_id = payment["id"]
                order.save()
                return Response({
                    "order_id": order.id,
                    "amount": payment["amount"],
                    "razorpay_order_id": payment["id"],
                })
            except Exception:
                order.razorpay_order_id = f"fake_rzp_{order.id}"
                order.save()
                return Response({
                    "order_id": order.id,
                    "amount": int(total_amount * 100),
                    "razorpay_order_id": order.razorpay_order_id,
                    "detail": "Razorpay mocked.",
                })

        return Response({"order_id": order.id}, status=status.HTTP_201_CREATED)


class OrderVerifyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get("razorpay_order_id")
        payment_id = request.data.get("razorpay_payment_id")
        signature = request.data.get("razorpay_signature")
        user = get_user_from_request(request)
        try:
            order = Order.objects.get(razorpay_order_id=razorpay_order_id, user=user)
            order.razorpay_payment_id = payment_id
            order.razorpay_signature = signature
            order.status = "Packed"
            order.save()
            return Response({"status": "Payment verified"})
        except Order.DoesNotExist:
            return Response({"detail": "Order not found"},
                            status=status.HTTP_404_NOT_FOUND)


class OrderHistoryView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = get_user_from_request(self.request)
        if not user:
            return Order.objects.none()
        return Order.objects.filter(user=user).order_by("-created_at")


# ── Admin ─────────────────────────────────────────────────────────────────────

class AdminProductUploadView(APIView):
    permission_classes = [IsAdminUser]

    def post(self, request):
        data = {
            "name":        request.data.get("name", ""),
            "description": request.data.get("description", ""),
            "price":       request.data.get("price", ""),
            "quantity":    request.data.get("quantity", ""),
            "image":       "",
        }
        image_file = request.FILES.get("image")
        if image_file:
            try:
                data["image"] = save_uploaded_image(image_file)
            except Exception as exc:
                return Response({"detail": f"Image save failed: {exc}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        serializer = ProductSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AdminProductUpdateView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found"},
                            status=status.HTTP_404_NOT_FOUND)

        data = {
            "name":        request.data.get("name", product.name),
            "description": request.data.get("description", product.description),
            "price":       request.data.get("price", product.price),
            "quantity":    request.data.get("quantity", product.quantity),
        }
        image_file = request.FILES.get("image")
        if image_file:
            try:
                data["image"] = save_uploaded_image(image_file)
            except Exception as exc:
                return Response({"detail": f"Image save failed: {exc}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        serializer = ProductSerializer(product, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            product = Product.objects.get(pk=pk)
            product.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Product.DoesNotExist:
            return Response({"detail": "Product not found"},
                            status=status.HTTP_404_NOT_FOUND)


class AdminOrderListView(generics.ListAPIView):
    queryset = Order.objects.all().order_by("-created_at")
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]


class AdminOrderUpdateView(generics.UpdateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminUser]

    def patch(self, request, *args, **kwargs):
        return self.partial_update(request, *args, **kwargs)
