# api/views.py

from django.http import JsonResponse, HttpResponseRedirect
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.template.loader import render_to_string
from django.contrib.auth import authenticate, logout
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import User
from .serializers import UserSerializer
from datetime import timedelta
import json
import jwt  
from django.http import JsonResponse
from django.utils.timezone import now
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import get_object_or_404
from django.contrib.auth import login



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

        try:
            user = User.objects.get(email=email)  
        except User.DoesNotExist:
            return Response({"success": False, "message": "Invalid Login Credentials!"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(password):
            return Response({"success": False, "message": "Invalid Login Credentials!"}, status=status.HTTP_400_BAD_REQUEST)

        user.backend = "api.auth_backends.EmailBackend"
        login(request, user)

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
        login(request, user)  # Log in the user using Django's session

        # Generate tokens using Simple JWT
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        response = JsonResponse({
            "message": "Logged in successfully!",
            "user": {"email": user.email},
        })
        # In development, set secure=False so cookies are accepted over HTTP.
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


            