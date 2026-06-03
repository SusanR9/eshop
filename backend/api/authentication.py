from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from rest_framework import exceptions


class TokenOnlyAuthentication(JWTAuthentication):
    """
    Custom JWT authenticator that reads claims directly from the token
    without performing a database user lookup.

    This supports both:
    - Regular users  (user_id = integer, is_staff = False)
    - Admin users    (user_id = integer from admin_login, is_staff = True)
    """

    def get_user(self, validated_token):
        """
        Instead of fetching from DB, return a lightweight object built
        purely from the token claims.
        """
        user_id  = validated_token.get("user_id")
        email    = validated_token.get("email", "")
        is_staff = bool(validated_token.get("is_staff", False))

        if user_id is None:
            raise exceptions.AuthenticationFailed("Token has no user_id claim.")

        return TokenUser(user_id=user_id, email=email, is_staff=is_staff)


class TokenUser:
    """Lightweight user-like object populated from JWT claims only."""

    def __init__(self, user_id, email, is_staff):
        self.id       = user_id
        self.pk       = user_id
        self.email    = email
        self.is_staff = is_staff

    # DRF / Django expected attributes
    is_active      = True
    is_anonymous   = False
    is_authenticated = True

    def has_perm(self, perm, obj=None):
        return self.is_staff

    def has_module_perms(self, app_label):
        return self.is_staff

    def __str__(self):
        return self.email
