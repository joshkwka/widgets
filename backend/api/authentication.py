from rest_framework_simplejwt.authentication import JWTAuthentication
from django.contrib.auth import get_user_model
from rest_framework.exceptions import AuthenticationFailed

class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        User = get_user_model() 
        user_id = validated_token.get("user_id")

        if not user_id:
            raise AuthenticationFailed("User ID missing from token.")

        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            raise AuthenticationFailed("User not found", code="user_not_found")
