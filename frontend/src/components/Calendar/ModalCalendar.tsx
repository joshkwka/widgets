import { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface Event {
  date: string;
  text: string;
}

const ModalCalendar = () => {
  const [date, setDate] = useState<Date | null>(new Date());
  const [eventText, setEventText] = useState("");
  const [events, setEvents] = useState<Event[]>([]);

  // Once backend is developed, replace localStorage with an API call
  // Load events from localStorage on mount
  useEffect(() => {
    const storedEvents = JSON.parse(localStorage.getItem("calendarEvents") || "[]");
    setEvents(storedEvents);
  }, []);

  // Save events to localStorage whenever `events` change
  useEffect(() => {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
  }, [events]);

  const handleAddEvent = () => {
    if (!date || eventText.trim() === "") return;

    const newEvent: Event = { date: date.toDateString(), text: eventText };
    const updatedEvents = [...events, newEvent];
    setEvents(updatedEvents);
    setEventText("");
  };

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold mb-2">Select a Date</h3>
      
      <Calendar
        onChange={(newDate) => setDate(newDate as Date)}
        value={date}
        className="border rounded-lg p-2 shadow-md"
      />

      <p className="mt-4 text-sm text-[var(--text-dark)]">
        Selected Date: <strong>{date?.toDateString()}</strong>
      </p>

      {/* Event Input & Button */}
      <div className="mt-4 w-full">
        <input
          type="text"
          placeholder="Add event..."
          className="p-2 border rounded w-full"
          value={eventText}
          onChange={(e) => setEventText(e.target.value)}
        />
        <button
          className="mt-2 p-2 w-full bg-[var(--primary-blue)] text-white rounded hover:bg-[var(--hover-blue)] transition"
          onClick={handleAddEvent}
        >
          Add Event
        </button>
      </div>

      {/* Display Events */}
      <div className="mt-4 w-full text-left">
        <h4 className="text-md font-semibold">Events on {date?.toDateString()}:</h4>
        {events.filter((event) => event.date === date?.toDateString()).length === 0 ? (
          <p className="text-gray-500">No events</p>
        ) : (
          <ul className="mt-2">
            {events
              .filter((event) => event.date === date?.toDateString())
              .map((event, index) => (
                <li key={index} className="p-2 bg-gray-200 rounded mt-1">{event.text}</li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ModalCalendar;
