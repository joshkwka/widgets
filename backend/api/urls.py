# api/urls.py

from django.urls import path
from .views import RegistrationView, LoginView, ProfileView, VerifyEmailView, ChangePasswordView, send_magic_login_email, magic_login
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
# from django_rest_passwordreset.views import reset_password_request_token, reset_password_confirm, reset_password_validate_token

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("register/", RegistrationView.as_view(), name="register"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("verify-email/<str:uidb64>/<str:token>/", VerifyEmailView.as_view(), name="verify_email"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path('send-magic-link/', send_magic_login_email, name="send_magic_link"),
    path('auth-login/', magic_login, name="magic_login"),
    path('change-password/', ChangePasswordView.as_view(), name="change_password"),
    # path('password_reset/', reset_password_request_token, name="password_reset"),
    # path('password_reset/confirm/', reset_password_confirm, name="password_reset_confirm"),
    # path('password_reset/validate_token/', reset_password_validate_token, name="password_reset_validate_token"),
]