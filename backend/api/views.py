# api/views.py

from django.shortcuts import render
from django.contrib.auth.hashers import make_password, check_password
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User, Token
from .serializers import UserSerializer, TokenSerializer
from django.conf import settings
from datetime import datetime, timedelta
import hashlib
import uuid
from django.utils import timezone

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
    def post(self, request, format=None):
        user_id = request.data.get("id")
        token = request.data.get("token")
        password = request.data.get("password")

        token_obj = Token.objects.filter(user_id=user_id).order_by("-created_at").first()
        
        if not token_obj:
            return Response({"success": False, "message": "Invalid or expired reset link!"}, status=status.HTTP_400_BAD_REQUEST)

        if token_obj.is_used:
            return Response({"success": False, "message": "Reset Password link has already been used!"}, status=status.HTTP_400_BAD_REQUEST)

        if token_obj.expires_at < timezone.now():
            return Response({"success": False, "message": "Password Reset Link has expired!"}, status=status.HTTP_400_BAD_REQUEST)

        if token_obj.token != token:
            return Response({"success": False, "message": "Invalid Reset Password link!"}, status=status.HTTP_400_BAD_REQUEST)

        hashed_password = make_password(password)
        ret_code = User.objects.filter(id=user_id).update(password=hashed_password)

        if ret_code:
            token_obj.is_used = True
            token_obj.save()
            return Response({"success": True, "message": "Your password has been reset successfully!"}, status=status.HTTP_200_OK)

        return Response({"success": False, "message": "Password reset failed!"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ForgotPasswordView(APIView):
    def post(self, request, format=None):
        email = request.data.get("email")

        if not email:
            return Response({"success": False, "message": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response(
                {"success": True, "message": "If this email exists, a reset link will be sent."},
                status=status.HTTP_200_OK,
            )

        created_at = timezone.now()
        expires_at = created_at + timedelta(days=1)
        token = hashlib.sha512((str(uuid.uuid4()) + created_at.isoformat()).encode("utf-8")).hexdigest()

        token_obj = {
            "token": token,
            "created_at": created_at,
            "expires_at": expires_at,
            "user_id": user.id,
        }
        serializer = TokenSerializer(data=token_obj)

        if serializer.is_valid():
            serializer.save()
            
            try:
                subject = "Forgot Password Link"
                content = mail_template(
                    "We received a request to reset your password. Please use the link below.",
                    f"{URL}/resetPassword?id={user.id}&token={token}",
                    "Reset Password",
                )
                send_mail(
                    subject=subject,
                    message=content,
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[email],
                    html_message=content,
                )
            except Exception as e:
                print(f"Email sending failed: {e}") 
                return Response(
                    {"success": False, "message": "Failed to send reset email."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        return Response(
            {"success": True, "message": "If this email exists, a reset link will be sent."},
            status=status.HTTP_200_OK,
        )




class RegistrationView(APIView):
    def post(self, request, format=None):
        request.data["email"] = request.data["email"].lower().strip()  
        request.data["password"] = make_password(request.data["password"])  
        
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"success": True, "message": "You are now registered!"},
                status=status.HTTP_201_CREATED,
            )
        else:
            return Response(
                {"success": False, "message": serializer.errors},
                status=status.HTTP_400_BAD_REQUEST,
            )




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
            },
            status=status.HTTP_200_OK,
        )
