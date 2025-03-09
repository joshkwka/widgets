from django.contrib import admin
from .models import User, Layout, WidgetPreference

@admin.register(User)
class CustomUserAdmin(admin.ModelAdmin):
    list_display = ("email", "first_name", "last_name", "is_active", "is_staff")
    search_fields = ("email", "first_name", "last_name")

@admin.register(Layout)
class LayoutAdmin(admin.ModelAdmin):
    list_display = ("user", "name", "widgets") 
    search_fields = ("user__email", "name")
    list_filter = ("user",)
    ordering = ("user",)

@admin.register(WidgetPreference)
class WidgetPreferenceAdmin(admin.ModelAdmin):
    list_display = ("user", "widget_id", "widget_type", "settings")  
    search_fields = ("user__email", "widget_id")
    ordering = ("user",)