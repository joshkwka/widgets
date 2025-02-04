document.addEventListener("DOMContentLoaded", function () {
    function updateClock() {
        const now = new Date();
        const clockElement = document.querySelector("#clock-data");

        if (clockElement) {
            console.log("Updating only clock-data, not entire widget");
            clockElement.textContent = now.toLocaleTimeString();
        } else {
            console.error("clock-data element not found");
        }
    }

    setInterval(updateClock, 1000);
    updateClock();
});
