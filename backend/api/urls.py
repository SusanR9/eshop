from django.urls import path
from .views import (
    SignupView, LoginView, AdminLoginView,
    ProductListView, ProductDetailView,
    OrderCreateView, OrderVerifyView, OrderHistoryView,
    AdminProductUploadView, AdminProductUpdateView,
    AdminOrderListView, AdminOrderUpdateView,
)

urlpatterns = [
    path("auth/signup/",      SignupView.as_view(),     name="signup"),
    path("auth/login/",       LoginView.as_view(),      name="login"),
    path("auth/admin-login/", AdminLoginView.as_view(), name="admin-login"),

    path("products/",          ProductListView.as_view(),   name="product-list"),
    path("products/<int:pk>/", ProductDetailView.as_view(), name="product-detail"),

    path("orders/create/",  OrderCreateView.as_view(),  name="order-create"),
    path("orders/verify/",  OrderVerifyView.as_view(),  name="order-verify"),
    path("orders/history/", OrderHistoryView.as_view(), name="order-history"),

    path("admin/products/",          AdminProductUploadView.as_view(), name="admin-product-upload"),
    path("admin/products/<int:pk>/", AdminProductUpdateView.as_view(), name="admin-product-update"),
    path("admin/orders/",            AdminOrderListView.as_view(),     name="admin-order-list"),
    path("admin/orders/<int:pk>/",   AdminOrderUpdateView.as_view(),   name="admin-order-update"),
]
