document.addEventListener("DOMContentLoaded", () => {
    const widgets = document.querySelectorAll(".widget");

    widgets.forEach(widget => {
        widget.style.position = "absolute";  // Ensure absolute positioning
        widget.setAttribute("draggable", "true");

        widget.addEventListener("mousedown", startDrag);
    });
});

function startDrag(event) {
    const widget = event.target.closest(".widget");
    if (!widget) return;

    let shiftX = event.clientX - widget.getBoundingClientRect().left;
    let shiftY = event.clientY - widget.getBoundingClientRect().top;

    function moveAt(pageX, pageY) {
        widget.style.left = pageX - shiftX + "px";
        widget.style.top = pageY - shiftY + "px";
    }

    function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
    }

    function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        
        // Save widget position after drag ends
        saveWidgetPosition(widget.id, widget.style.left, widget.style.top);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);

    moveAt(event.pageX, event.pageY);
}

function saveWidgetPosition(widgetId, left, top) {
    let csrfToken = document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

    let requestBody = JSON.stringify({
        widget_id: widgetId,
        x: parseInt(left),
        y: parseInt(top),
    });

    console.log("Sending request:", requestBody);

    fetch("/dashboard/save-widget-position/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        body: requestBody,
    })
    .then(response => response.json())
    .then(data => console.log("Position saved:", data))
    .catch(error => console.error("Error saving position:", error));
}