# api/urls.py

from django.urls import path, include
from .views import RegistrationView, LoginView, ProfileView, ChangePasswordView, UpdateProfileView, DeleteAccountView, send_magic_login_email, magic_login
from .views import LayoutViewSet, WidgetPreferenceViewSet

from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"layouts", LayoutViewSet)
router.register(r"widget-preferences", WidgetPreferenceViewSet)

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("register/", RegistrationView.as_view(), name="register"),
    path("profile/", ProfileView.as_view(), name="profile"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path('send-magic-link/', send_magic_login_email, name="send_magic_link"),
    path('auth-login/', magic_login, name="magic_login"),
    path('change-password/', ChangePasswordView.as_view(), name="change_password"),
    path('update-profile/', UpdateProfileView.as_view(), name='update-profile'),
    path('delete-account/', DeleteAccountView.as_view(), name='delete-account'),

    # Automatically register layout and widget preference routes
    path("", include(router.urls)),
]

