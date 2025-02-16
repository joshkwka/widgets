document.addEventListener("DOMContentLoaded", () => {
    const digitalClockContainer = document.getElementById("clock-container");
    const analogClock = document.getElementById("analog-clock");
    const toggleButton = document.getElementById("toggle-mode");
    const addTimezoneBtn = document.getElementById("add-timezone-btn");

    let isAnalog = false;
    let timezones = [{ label: "Local Time", tz: "local" }];

    function updateClock() {
        digitalClockContainer.innerHTML = ""; // Clear previous clock entries

        timezones.forEach((tzObj, index) => {
            let now = new Date();

            if (tzObj.tz !== "local") {
                let options = { timeZone: tzObj.tz };
                now = new Date(new Intl.DateTimeFormat("en-US", options).format(now));
            }

            // Format Time
            const hours = now.getHours().toString().padStart(2, "0");
            const minutes = now.getMinutes().toString().padStart(2, "0");
            const seconds = now.getSeconds().toString().padStart(2, "0");

            // Create Clock Entry
            const clockEntry = document.createElement("div");
            clockEntry.classList.add("clock-entry");
            clockEntry.dataset.timezone = tzObj.tz;
            clockEntry.innerHTML = `
                <span class="clock-label">${tzObj.label}</span>
                <span class="clock-time">${hours}:${minutes}:${seconds}</span>
                ${index > 0 ? `<button class="remove-btn" data-index="${index}">✖</button>` : ""}
            `;

            digitalClockContainer.appendChild(clockEntry);
        });

        // Analog Clock Update
        const now = new Date();
        const hoursDeg = ((now.getHours() % 12) / 12) * 360 + 90;
        const minutesDeg = (now.getMinutes() / 60) * 360 + 90;
        const secondsDeg = (now.getSeconds() / 60) * 360 + 90;

        document.querySelector(".hour-hand").style.transform = `rotate(${hoursDeg}deg) translateY(-50%)`;
        document.querySelector(".minute-hand").style.transform = `rotate(${minutesDeg}deg) translateY(-50%)`;
        document.querySelector(".second-hand").style.transform = `rotate(${secondsDeg}deg) translateY(-50%)`;

        // Add Remove Event Listeners
        document.querySelectorAll(".remove-btn").forEach(button => {
            button.addEventListener("click", (event) => {
                timezones.splice(event.target.dataset.index, 1);
                updateClock();
            });
        });
    }

    // Toggle between digital & analog
    toggleButton.addEventListener("click", () => {
        isAnalog = !isAnalog;
        if (isAnalog) {
            digitalClockContainer.style.display = "none";
            analogClock.style.display = "flex";
            toggleButton.innerText = "Switch to Digital";
        } else {
            digitalClockContainer.style.display = "block";
            analogClock.style.display = "none";
            toggleButton.innerText = "Switch to Analog";
        }
    });

    // Add a new timezone
    addTimezoneBtn.addEventListener("click", () => {
        const newTimezone = prompt("Enter a valid IANA timezone (e.g., 'America/New_York'):");
        if (newTimezone) {
            try {
                new Intl.DateTimeFormat("en-US", { timeZone: newTimezone }).format(new Date());
                timezones.push({ label: newTimezone, tz: newTimezone });
                updateClock();
            } catch (error) {
                alert("Invalid timezone! Please enter a correct IANA timezone.");
            }
        }
    });

    // Update clock every second
    setInterval(updateClock, 1000);
    updateClock();
});
