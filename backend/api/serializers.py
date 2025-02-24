# api/serializers.py
from django.contrib.auth.hashers import make_password

from rest_framework import serializers
from .models import User, Token


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True) 

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "password"]

    def create(self, validated_data):
        validated_data["password"] = make_password(validated_data["password"])  
        return super().create(validated_data)



class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Token
        fields = ["token", "created_at", "expires_at", "user_id", "is_used"]