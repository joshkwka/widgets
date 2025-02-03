from django.urls import path
from .views import dashboard_home, save_widget_position
urlpatterns = [
    path('', dashboard_home, name="dashboard_home"),
    path('save-widget-position/', save_widget_position, name="save_widget_position"),
]