# api/views.py

import json
import jwt  
import uuid

from datetime import timedelta
from django.conf import settings
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.timezone import now
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status, viewsets, permissions
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView

from .models import User, Layout, WidgetPreference
from .serializers import LayoutSerializer, WidgetPreferenceSerializer, UserSerializer

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

def send_verification_email(user: User):
    payload = {
        "user_id": user.id,
        "email_verification": True,
        "exp": int((now() + timedelta(hours=1)).timestamp())
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

    verification_link = f"{URL}/auth-login?token={token}"

    subject = "Verify Your Email"

    content = f"""
    Welcome to Widgets!<br><br>
    Please verify your email by clicking the button below.
    """
    message = mail_template(content, verification_link, "Verify Email")

    send_mail(
        subject,
        "Please enable HTML to view this message",  # Fallback plain text
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
        html_message=message
    )

#=====================================================================================#
# VIEWS
#=====================================================================================#

class RegistrationView(APIView):
    def post(self, request):
        print("Received Registration Data:", request.data)

        email = request.data.get("email")
        existing_user = User.objects.filter(email=email).first()

        if existing_user:
            if not existing_user.is_verified:
                # Resend verification email if they haven't verified yet
                send_verification_email(existing_user)

                return Response({
                    "success": True,
                    "message": "Verification email resent. Please check your inbox."
                }, status=status.HTTP_200_OK)

            return Response({
                "success": False,
                "message": "Email is already in use."
            }, status=status.HTTP_400_BAD_REQUEST)

        # Create a new user
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                user.is_active = False  # Don't allow login until verified
                user.is_verified = False
                user.save()

                # Send verification email using the JWT approach
                send_verification_email(user)

                return Response({
                    "success": True,
                    "message": "Verification email sent. Please check your inbox."
                }, status=status.HTTP_201_CREATED)

            except Exception as e:
                print(f"ERROR DURING USER CREATION: {e}")
                return Response({
                    "success": False,
                    "message": f"Internal Server Error: {str(e)}"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        print("Serializer Errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    def post(self, request, format=None):
        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(request, email=email, password=password)

        if user is None:
            return Response({"success": False, "message": "Invalid Login Credentials!"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_verified:
            return Response({"success": False, "message": "Please verify your email before logging in."}, status=status.HTTP_400_BAD_REQUEST)

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

SECRET_KEY = settings.SECRET_KEY 

@csrf_exempt
def send_magic_login_email(request):
    if request.method != "POST":
        return JsonResponse({"error": "Invalid request method."}, status=400)

    data = json.loads(request.body)
    email = data.get("email")

    # Ensure user exists
    user = get_object_or_404(User, email=email)

    # Create a JWT token valid for 15 minutes
    payload = {
        "user_id": user.id,
        "exp": int((now() + timedelta(minutes=15)).timestamp()),
    }
    token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

    # Send login link via email
    login_link = f"{URL}/auth-login?token={token}"
    send_mail(
        "Your Secure Login Link",
        f"Click this link to log in and reset your password: {login_link}",
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )

    return JsonResponse({"message": "Login link sent!"}, status=200)

@csrf_exempt
def magic_login(request):
    if request.method == "GET":
        token = request.GET.get("token")
    elif request.method == "POST":
        data = json.loads(request.body)
        token = data.get("token")
    else:
        return JsonResponse({"error": "Invalid request method."}, status=400)

    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user = get_object_or_404(User, id=payload["user_id"])

        if payload.get("email_verification"):
            user.is_verified = True
            user.is_active = True
            user.save()

            # Trigger an event for your frontend to show a "Verification Successful" message
            response = JsonResponse({
                "message": "Email verified successfully!",
                "user": {"email": user.email},
            })
            response.set_cookie("verification_success", "true", max_age=60, secure=False, samesite="Lax")
            return response

        # Otherwise, it's a normal magic login flow
        login(request, user)

        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = JsonResponse({
            "message": "Logged in successfully!",
            "user": {"email": user.email},
        })
        response.set_cookie("access_token", access_token, max_age=7*24*60*60, secure=False, samesite="Lax")
        response.set_cookie("refresh_token", refresh_token, max_age=30*24*60*60, secure=False, samesite="Lax")
        return response

    except jwt.ExpiredSignatureError:
        return JsonResponse({"error": "Token has expired."}, status=400)
    except jwt.InvalidTokenError:
        return JsonResponse({"error": "Invalid token."}, status=400)

########## CHANGE secure=True FOR DEPLOYMENT



class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        new_password = request.data.get("password")

        if not new_password:
            return Response({"error": "Password is required."}, status=400)

        try:
            request.user.set_password(new_password)
            request.user.save()
            request.user.refresh_from_db()
            
            # Force clear Django’s authentication cache
            request.user = User.objects.get(pk=request.user.pk)
            
            logout(request)

            response = Response({"message": "Password updated successfully! You have been logged out."}, status=200)
            response.delete_cookie("access_token")
            response.delete_cookie("refresh_token")

            return response

        except Exception as e:
            print("Error updating password:", str(e))
            return Response({"error": str(e)}, status=500)

class UpdateProfileView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def post(self, request):
        user = request.user
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")

        if not first_name or not last_name:
            return Response({"success": False, "message": "Both first name and last name are required."}, status=status.HTTP_400_BAD_REQUEST)

        user.first_name = first_name
        user.last_name = last_name
        user.save()

        return Response({
            "success": True,
            "message": "Profile updated successfully!",
            "user": {
                "first_name": user.first_name,
                "last_name": user.last_name,
                "email": user.email,
            },
        }, status=status.HTTP_200_OK)


class DeleteAccountView(APIView):
    permission_classes = [IsAuthenticated]
    authentication_classes = [JWTAuthentication]

    def delete(self, request):
        user = request.user
        user.delete()

        response = Response({"success": True, "message": "Your account has been deleted."}, status=status.HTTP_200_OK)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response

# Widgets



class LayoutViewSet(viewsets.ModelViewSet):
    queryset = Layout.objects.all()
    serializer_class = LayoutSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        widgets_data = self.request.data.get("widgets", [])

        if not isinstance(widgets_data, list):  
            raise ValidationError({"widgets": "Must be a list of widget objects."})

        serializer.save(user=self.request.user, widgets=widgets_data)

    def destroy(self, request, *args, **kwargs):
        """Allow users to delete their own layouts"""
        instance = self.get_object()
        
        if instance.user != request.user:
            return Response(
                {"error": "Unauthorized action"},
                status=status.HTTP_403_FORBIDDEN
            )
        self.perform_destroy(instance)
        return Response({"message": "Layout deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

class WidgetPreferenceViewSet(viewsets.ModelViewSet):
    queryset = WidgetPreference.objects.all()
    serializer_class = WidgetPreferenceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        widget_id = self.request.data.get("widget_id")

        # Validate widget_id as UUID
        try:
            widget_uuid = uuid.UUID(widget_id)
        except ValueError:
            raise ValidationError({"widget_id": "Invalid UUID format."})

        # Save preference
        serializer.save(user=self.request.user, widget_id=str(widget_uuid))

    def destroy(self, request, *args, **kwargs):
        """Allow users to delete their own widget preferences"""
        instance = self.get_object()
        
        # Ensure the user is deleting their own widget
        if instance.user != request.user:
            return Response(
                {"error": "Unauthorized action"},
                status=status.HTTP_403_FORBIDDEN
            )

        self.perform_destroy(instance)
        return Response({"message": "Widget preference deleted successfully"}, status=status.HTTP_204_NO_CONTENT)

