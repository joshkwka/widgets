WIDGETS = {
    "clock": {
        "title": "Clock",
        "template": "dashboard/widgets/clock.html",
        "default_config": {"format": "24h", "timezone": "UTC"},
    },
    # "weather": {
    #     "title": "Weather",
    #     "template": "dashboard/widgets/weather.html",
    #     "default_config": {"location": "New York", "units": "metric"},
    # },
    "todo": {
        "title": "To-Do List",
        "template": "dashboard/widgets/todo.html",
        "default_config": {},
    },
}

def get_widget_data(title):
    """Retrieve widget metadata from the registry."""
    return WIDGETS.get(title, None)