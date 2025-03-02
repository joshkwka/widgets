from django.contrib.auth.backends import ModelBackend
from api.models import User

class EmailBackend(ModelBackend):
    """
    Custom authentication backend that allows users to authenticate with email instead of username.
    """

    def authenticate(self, request, email=None, password=None, **kwargs):
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                user.backend = "api.auth_backends.EmailBackend"
                return user
        except User.DoesNotExist:
            return None
