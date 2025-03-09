from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import uuid

class UserManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, password=None):
        """
        Creates and returns a regular user with an email, first name, last name, and password.
        """
        if not email:
            raise ValueError("Users must have an email address")
        if not password:
            raise ValueError("Users must have a password") 
        email = self.normalize_email(email)
        user = self.model(email=email, first_name=first_name, last_name=last_name)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name, password=None):
        user = self.create_user(email, first_name, last_name, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class User(AbstractBaseUser, PermissionsMixin): 
    is_verified = models.BooleanField(default=False)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)  

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["first_name", "last_name"]

    def __str__(self):
        return self.email

class Token(models.Model):
    id = models.AutoField(primary_key=True)
    token = models.CharField(max_length=255)
    created_at = models.DateTimeField()
    expires_at = models.DateTimeField()
    user_id = models.IntegerField()
    is_used = models.BooleanField(default=False)


# Widgets

class Layout(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    # Stores widget positions & settings in a format compatible with react-grid-layout
    widgets = models.JSONField(default=list)  # Example: [{"i": "clock1", "x": 0, "y": 0, "w": 2, "h": 2, "type": "clock"}]

    def __str__(self):
        return f"{self.user.email} - {self.name}"

class WidgetPreference(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    widget_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)  # Unique ID per widget instance
    widget_type = models.CharField(max_length=50)  # E.g., "clock", "todo"
    settings = models.JSONField(default=dict)  # Store user-specific widget preferences

    def __str__(self):
        return f"{self.user.email} - {self.widget_type} ({self.widget_id})"