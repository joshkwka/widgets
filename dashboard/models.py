from django.db import models
from django.contrib.auth.models import User

class Widget(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    widget_type = models.CharField(max_length=50)  
    config = models.JSONField(default=dict)  # Store widget settings per user
    archived = models.BooleanField(default=False)
    position = models.JSONField(default=dict)  # Store x, y positions
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username if self.user else 'Default'} - {self.widget_type}"
