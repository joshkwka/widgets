from django.shortcuts import render
from django.http import JsonResponse
from .models import Widget
from .widgets_registry import WIDGETS
from django.views.decorators.csrf import csrf_protect

import json
import logging 

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

logger = logging.getLogger(__name__)

def dashboard_home(request):
    """
    Render the dashboard with default and user-created widgets.
    """
    user_widgets = Widget.objects.filter(user=request.user, archived=False) if request.user.is_authenticated else []

    default_widgets = []
    for widget_type, widget_data in WIDGETS.items():
        widget_config = widget_data.get("default_config", {})
        widget_position = {"x": 100, "y": 100}  

        if request.user.is_authenticated:
            user_widget = Widget.objects.filter(user=request.user, widget_type=widget_type).first()
            if user_widget:
                widget_config = user_widget.config  
                widget_position = user_widget.position if user_widget.position else widget_position

        default_widgets.append({
            "widget_type": widget_type,
            "title": widget_data["title"],
            "template": widget_data["template"],
            "config": widget_config,
            "position": widget_position
        })

    return render(request, "dashboard/home.html", {
        "widgets": user_widgets,
        "default_widgets": default_widgets,
    })

@csrf_protect
def save_widget_position(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            widget_id = data.get("widget_id")
            x = data.get("x")
            y = data.get("y")

            if not widget_id or x is None or y is None:
                raise ValueError("Missing required fields: widget_id, x, or y")

            logger.info(f"Received widget move request: ID={widget_id}, x={x}, y={y}")
            return JsonResponse({"status": "success"})

        except json.JSONDecodeError as e:
            logger.error(f"JSON Decode Error: {str(e)}")
            return JsonResponse({"status": "error", "message": "Invalid JSON format"}, status=400)

        except Exception as e:
            logger.error(f"Internal Server Error: {str(e)}")
            return JsonResponse({"status": "error", "message": str(e)}, status=500)

    return JsonResponse({"status": "error", "message": "Invalid request"}, status=400)

@csrf_protect
def save_widget_size(request):
    if request.method == "POST" and request.user.is_authenticated:
        data = json.loads(request.body)
        widget_id = data.get("widget_id").replace("widget-", "")
        new_width = data.get("width")
        new_height = data.get("height")

        try:
            widget = Widget.objects.get(id=int(widget_id), user=request.user)
            widget.size = {"width": new_width, "height": new_height}
            widget.save()
            return JsonResponse({"status": "success"})
        except Widget.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Widget not found"}, status=404)

    return JsonResponse({"status": "error"}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": "You have access!"})
