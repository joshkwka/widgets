# api/views.py

from django.shortcuts import render
from django.utils import timezone
from django.http import JsonResponse
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.hashers import make_password, check_password
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, Token
from .serializers import UserSerializer, TokenSerializer
from datetime import datetime, timedelta
import hashlib
import uuid



SALT = "8b4f6b2cc1868d75ef79e5cfb8779c11b6a374bf0fce05b485581bf4e1e25b96c8c2855015de8449"
URL = "http://localhost:3000"


def mail_template(content, button_url, button_text):
    return f"""<!DOCTYPE html>
            <html>
            <body style="text-align: center; font-family: "Verdana", serif; color: #000;">
                <div style="max-width: 600px; margin: 10px; background-color: #fafafa; padding: 25px; border-radius: 20px;">
                <p style="text-align: left;">{content}</p>
                <a href="{button_url}" target="_blank">
                    <button style="background-color: #444394; border: 0; width: 200px; height: 30px; border-radius: 6px; color: #fff;">{button_text}</button>
                </a>
                <p style="text-align: left;">
                    If you are unable to click the above button, copy paste the below URL into your address bar
                </p>
                <a href="{button_url}" target="_blank">
                    <p style="margin: 0px; text-align: left; font-size: 10px; text-decoration: none;">{button_url}</p>
                </a>
                </div>
            </body>
            </html>"""

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64=None, token=None):
        password = request.data.get("password")

        if not password:
            return Response({"success": False, "message": "Password is required"}, status=400)

        if uidb64 and token:
            try:
                uid = urlsafe_base64_decode(uidb64).decode()
                user = User.objects.get(pk=uid)
            except (User.DoesNotExist, ValueError, TypeError):
                return Response({"success": False, "message": "Invalid token or user."}, status=400)

            # Validate the token
            if not default_token_generator.check_token(user, token):
                return Response({"success": False, "message": "Invalid or expired token."}, status=400)

            # Update the password
            user.set_password(password)  # Hashes and updates the password
            user.save()  # Save the user object with the new password

            return Response({"success": True, "message": "Password reset successfully."}, status=200)
        
        return Response({"success": False, "message": "Invalid request. UID or token missing."}, status=400)
    
class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]  # No authentication required

    def post(self, request):
        email = request.data.get("email")

        if not email:
            return Response({"success": False, "message": "Email is required"}, status=400)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response(
                {"success": True, "message": "If this email exists, a reset link will be sent."},
                status=200
            )

        # Generate reset token
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = default_token_generator.make_token(user)
        reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

        # Send email
        subject = "Reset Your Password"
        content = mail_template(
            "We received a request to reset your password. Click the link below:",
            reset_url,
            "Reset Password"
        )

        send_mail(
            subject=subject,
            message=content,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            html_message=content
        )

        return Response({"success": True, "message": "Password reset email sent."}, status=200)

class RegistrationView(APIView):
    def post(self, request):
        print("Received Registration Data:", request.data)  

        email = request.data.get("email")
        existing_user = User.objects.filter(email=email).first()

        if existing_user:
            if not existing_user.is_active:
                # Resend verification email
                uid = urlsafe_base64_encode(force_bytes(existing_user.pk))
                token = default_token_generator.make_token(existing_user)
                verification_link = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"

                subject = "Verify Your Account"
                message = render_to_string('email_verification.html', {
                    'user': existing_user,
                    'verification_link': verification_link
                })

                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[existing_user.email],
                    html_message=message
                )

                return Response({"success": True, "message": "Verification email resent. Please check your inbox."}, status=status.HTTP_200_OK)

            return Response({"success": False, "message": "Email is already in use."}, status=status.HTTP_400_BAD_REQUEST)

        # Create a new user
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                user.is_active = False  # Prevent login until email is verified
                user.save()

                # Generate verification token
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                token = default_token_generator.make_token(user)
                verification_link = f"{settings.FRONTEND_URL}/verify-email/{uid}/{token}/"

                # Send email
                subject = "Verify Your Account"
                message = render_to_string('email_verification.html', {
                    'user': user,
                    'verification_link': verification_link
                })

                print("Sending email to:", user.email)  

                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[user.email],
                    html_message=message
                )

                return Response({"success": True, "message": "Verification email sent. Please check your inbox."}, status=status.HTTP_201_CREATED)

            except Exception as e:
                print(f"ERROR DURING USER CREATION: {e}")  
                return Response({"success": False, "message": f"Internal Server Error: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        print("Serializer Errors:", serializer.errors)  
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    def post(self, request, format=None):
        email = request.data.get("email")
        password = request.data.get("password")

        user = User.objects.filter(email=email).first()
        if user is None:
            return Response({"success": False, "message": "Invalid Login Credentials!"}, status=status.HTTP_400_BAD_REQUEST)

        if not check_password(password, user.password):
            return Response({"success": False, "message": "Invalid Login Credentials!"}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "success": True,
                "message": "You are now logged in!",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": {  
                    "first_name": user.first_name or "User",
                    "last_name": user.last_name or "",
                    "email": user.email
                }
            },
            status=status.HTTP_200_OK,
        )


class ProfileView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        if not request.user.is_authenticated:
            return Response({"success": False, "message": "Unauthorized"}, status=status.HTTP_401_UNAUTHORIZED)

        return Response(
            {
                "success": True,
                "message": "User profile fetched successfully!",
                "user": {
                    "first_name": request.user.first_name,
                    "last_name": request.user.last_name,
                    "email": request.user.email,
                },
            },
            status=status.HTTP_200_OK,
        )

class VerifyEmailView(APIView):
    permission_classes = [AllowAny]  # No authentication required

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return JsonResponse(
                {"success": False, "message": "Invalid verification link."},
                status=400
            )

        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return JsonResponse(
                {"success": True, "message": "Email verified successfully! You may now log in."},
                status=200
            )

        return JsonResponse(
            {"success": False, "message": "Invalid or expired verification link."},
            status=400
        )
