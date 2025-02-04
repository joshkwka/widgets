/////////////////////////////////////////////
//////////// Widget Initial Size ////////////
/////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
    const gridSize = 50;
    const widgets = document.querySelectorAll(".widget");

    widgets.forEach(widget => {
        widget.style.position = "absolute";

        // Ensure initial size snaps to grid
        let width = widget.offsetWidth;
        let height = widget.offsetHeight;

        let correctedWidth = Math.round(width / gridSize) * gridSize;
        let correctedHeight = Math.round(height / gridSize) * gridSize;

        if (width !== correctedWidth || height !== correctedHeight) {
            widget.style.width = `${correctedWidth}px`;
            widget.style.height = `${correctedHeight}px`;
        }

        // Make widgets draggable and resizable
        const dragHandle = widget.querySelector(".drag-handle");
        if (dragHandle) {
            dragHandle.addEventListener("mousedown", (event) => startDrag(event, widget));
        }
        makeWidgetResizable(widget);
    });
});


/////////////////////////////////////////////
////////////// Widget Dragging //////////////
/////////////////////////////////////////////

document.addEventListener("DOMContentLoaded", () => {
    const widgets = document.querySelectorAll(".widget");

    widgets.forEach(widget => {
        widget.style.position = "absolute";

        const dragHandle = widget.querySelector(".drag-handle");
        if (dragHandle) {
            dragHandle.addEventListener("mousedown", (event) => startDrag(event, widget));
        }

        makeWidgetResizable(widget);
    });
});

function startDrag(event, widget) {
    const gridSize = 50; 
    const container = document.getElementById("main-content");
    const thinSidebarWidth = document.getElementById("thin-sidebar").offsetWidth; 
    const widgets = document.querySelectorAll(".widget");

    let shiftX = event.clientX - widget.getBoundingClientRect().left;
    let shiftY = event.clientY - widget.getBoundingClientRect().top;

    widget.style.transition = "none"; 

    function moveAt(pageX, pageY) {
        let snappedX = Math.round((pageX - shiftX) / gridSize) * gridSize;
        let snappedY = Math.round((pageY - shiftY) / gridSize) * gridSize;

        // Prevent dragging behind the thin sidebar
        let minX = thinSidebarWidth; 
        let maxX = container.offsetWidth - widget.offsetWidth;
        let maxY = container.offsetHeight - widget.offsetHeight;

        snappedX = Math.max(minX, Math.min(snappedX, maxX));
        snappedY = Math.max(0, Math.min(snappedY, maxY));

        // Prevent overlapping with other widgets
        let isOverlapping = false;
        widgets.forEach(otherWidget => {
            if (otherWidget !== widget) {
                let rect1 = {
                    x: snappedX,
                    y: snappedY,
                    width: widget.offsetWidth,
                    height: widget.offsetHeight
                };
                let rect2 = {
                    x: parseInt(otherWidget.style.left, 10),
                    y: parseInt(otherWidget.style.top, 10),
                    width: otherWidget.offsetWidth,
                    height: otherWidget.offsetHeight
                };

                if (
                    rect1.x < rect2.x + rect2.width &&
                    rect1.x + rect1.width > rect2.x &&
                    rect1.y < rect2.y + rect2.height &&
                    rect1.y + rect1.height > rect2.y
                ) {
                    isOverlapping = true;
                }
            }
        });

        if (!isOverlapping) {
            widget.style.left = `${snappedX}px`;
            widget.style.top = `${snappedY}px`;
        }
    }

    function onMouseMove(event) {
        moveAt(event.pageX, event.pageY);
    }

    function onMouseUp() {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        // Add smooth transition back after dragging stops
        setTimeout(() => {
            widget.style.transition = "left 0.2s ease-out, top 0.2s ease-out";
        }, 50);

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

/////////////////////////////////////////////
///////////// Widget Re-Sizing //////////////
/////////////////////////////////////////////

function makeWidgetResizable(widget) {
    const gridSize = 50;

    let resizeHandle = document.createElement("div");
    resizeHandle.classList.add("resize-handle");
    widget.appendChild(resizeHandle);

    resizeHandle.addEventListener("mousedown", (event) => startResize(event, widget));
}

function startResize(event, widget) {
    event.preventDefault();
    console.log("Resizing started for:", widget.id);

    const gridSize = 50;
    const container = document.getElementById("main-content"); 
    const widgets = document.querySelectorAll(".widget");

    let startX = event.clientX;
    let startY = event.clientY;
    let startWidth = widget.offsetWidth;
    let startHeight = widget.offsetHeight;

    function resize(event) {
        let deltaX = event.clientX - startX;
        let deltaY = event.clientY - startY;

        let newWidth = Math.round((startWidth + deltaX) / gridSize) * gridSize;
        let newHeight = Math.round((startHeight + deltaY) / gridSize) * gridSize;

        // Get global positions of bottom-right corner
        let widgetRight = parseInt(widget.style.left, 10) + newWidth;
        let widgetBottom = parseInt(widget.style.top, 10) + newHeight;

        let containerRight = container.offsetWidth - 40;
        let containerBottom = container.offsetHeight - 40;

        // Ensure resizing does NOT go beyond screen bounds
        if (widgetRight > containerRight) {
            newWidth = containerRight - parseInt(widget.style.left, 10);
        }
        if (widgetBottom > containerBottom) {
            newHeight = containerBottom - parseInt(widget.style.top, 10);
        }

        // Prevent shrinking below the grid size
        newWidth = Math.max(gridSize, newWidth);
        newHeight = Math.max(gridSize, newHeight);

        // Prevent overlapping with other widgets
        let isOverlapping = false;
        widgets.forEach(otherWidget => {
            if (otherWidget !== widget) {
                let rect1 = {
                    x: parseInt(widget.style.left, 10),
                    y: parseInt(widget.style.top, 10),
                    width: newWidth,
                    height: newHeight
                };
                let rect2 = {
                    x: parseInt(otherWidget.style.left, 10),
                    y: parseInt(otherWidget.style.top, 10),
                    width: otherWidget.offsetWidth,
                    height: otherWidget.offsetHeight
                };

                if (
                    rect1.x < rect2.x + rect2.width &&
                    rect1.x + rect1.width > rect2.x &&
                    rect1.y < rect2.y + rect2.height &&
                    rect1.y + rect1.height > rect2.y
                ) {
                    isOverlapping = true;
                }
            }
        });

        // Apply new width and height ONLY if there's no overlap
        if (!isOverlapping) {
            widget.style.width = `${newWidth}px`;
            widget.style.height = `${newHeight}px`;
        }
    }

    function stopResize() {
        document.removeEventListener("mousemove", resize);
        document.removeEventListener("mouseup", stopResize);

        saveWidgetSize(widget.id, widget.style.width, widget.style.height);
    }

    document.addEventListener("mousemove", resize);
    document.addEventListener("mouseup", stopResize);
}

function saveWidgetSize(widgetId, width, height) {
    let csrfToken = document.cookie.split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1];

    let requestBody = JSON.stringify({
        widget_id: widgetId,
        width: parseInt(width),
        height: parseInt(height),
    });

    console.log("Sending size update:", requestBody);

    fetch("/dashboard/save-widget-size/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken,
        },
        body: requestBody,
    })
    .then(response => response.json())
    .then(data => console.log("Size saved:", data))
    .catch(error => console.error("Error saving size:", error));
}


/////////////////////////////////////////////
///////////// Sidebar Controls //////////////
/////////////////////////////////////////////

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const mainContent = document.getElementById("main-content");

    if (sidebar.classList.contains("open")) {
        sidebar.classList.remove("open"); 
        mainContent.classList.remove("shift"); 
    } else {
        sidebar.classList.add("open"); 
        mainContent.classList.add("shift"); 
    }
}

/* Handle Navigation Clicks */
function navigateTo(page) {
    console.log(`Navigating to ${page}...`);
    // Later: Implement actual page navigation
}


