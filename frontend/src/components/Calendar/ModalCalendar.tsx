import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import dayjs from "dayjs";

interface Event {
  date: string;
  time: string;
  text: string;
  category: string;
}

// **Category Colors**
const CATEGORIES = ["Work", "Personal", "Family", "Other"];
const CATEGORY_COLORS: { [key: string]: string } = {
  Work: "#E57373", // Soft Red
  Personal: "#81C784", // Soft Green
  Family: "#64B5F6", // Soft Blue
  Other: "#B0BEC5", // Soft Gray
};

const ModalCalendar = () => {
  const [date, setDate] = useState<Date | null>(new Date());
  const [eventText, setEventText] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventCategory, setEventCategory] = useState("Work");
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [visibleCategories, setVisibleCategories] = useState<string[]>(CATEGORIES);

  const handleAddEvent = () => {
    if (!date || eventText.trim() === "" || eventTime.trim() === "") return;

    const newEvent: Event = {
      date: dayjs(date).format("YYYY-MM-DD"),
      time: eventTime,
      text: eventText,
      category: eventCategory,
    };

    setEvents([...events, newEvent]);
    setEventText("");
    setEventTime("");
    setShowEventForm(false);
  };

  const toggleCategory = (category: string) => {
    setVisibleCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  // Group events by time
  const groupedEvents = Object.entries(
    events
      .filter((e) => e.date === dayjs(date).format("YYYY-MM-DD"))
      .filter((e) => visibleCategories.includes(e.category))
      .reduce((grouped, event) => {
        const timeKey = event.time.slice(0, 5);
        if (!grouped[timeKey]) {
          grouped[timeKey] = [];
        }
        grouped[timeKey].push(event);
        return grouped;
      }, {} as Record<string, Event[]>)
  ).sort(([timeA], [timeB]) => (timeA > timeB ? 1 : -1));

  return (
    <div className="flex w-full p-6">
      {/* Calendar Section */}
      <div className="w-3/4 p-6">
        <Calendar
          onChange={(newDate) => setDate(newDate as Date)}
          value={date}
          className="border border-[var(--border)] rounded-lg p-4 shadow-md w-full"
          tileClassName={({ date }) => {
            const today = dayjs().format("YYYY-MM-DD");
            return dayjs(date).format("YYYY-MM-DD") === today ? "today-highlight" : "";
          }}
          tileContent={({ date }) => {
            const eventDays = events
              .filter((e) => e.date === dayjs(date).format("YYYY-MM-DD"))
              .filter((e) => visibleCategories.includes(e.category));

            const uniqueCategories = CATEGORIES.filter((category) =>
              eventDays.some((event) => event.category === category)
            );

            return (
              <div className="flex justify-center mt-1">
                {uniqueCategories.map((category, index) => (
                  <span
                    key={index}
                    className="w-2 h-2 rounded-full mx-0.5"
                    style={{ backgroundColor: CATEGORY_COLORS[category] }}
                  />
                ))}
              </div>
            );
          }}
        />

        {/* Category Filters */}
        <div className="mt-4 flex justify-center space-x-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`px-4 py-2 text-sm rounded-lg transition ${
                visibleCategories.includes(cat)
                  ? "bg-[var(--primary-blue)] text-white shadow-md"
                  : "bg-gray-200 text-gray-700"
              } hover:shadow-lg`}
              onClick={() => toggleCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Day View */}
      <div className="w-1/2 p-6 border-l border-[var(--border)]">
        <h4 className="text-lg font-semibold text-center">{dayjs(date).format("dddd, MMMM D, YYYY")}</h4>

        {/* Only show event list if there are events */}
        {groupedEvents.length > 0 && (
          <div className="mt-4 border border-[var(--border)] bg-[var(--background)] rounded-lg p-4 shadow-md max-h-[450px] overflow-y-auto">
            {groupedEvents.map(([time, eventsAtTime], index) => (
              <div key={index} className="border-b border-[var(--border)] p-2">
                <strong className="text-gray-700">{time}</strong>
                {eventsAtTime.map((event, i) => (
                  <div key={i} className="flex items-center p-2 rounded mt-1 shadow-sm border border-[var(--border)]">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: CATEGORY_COLORS[event.category] }} />
                    <span className="text-sm">{event.text}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Add Event Button */}
        <button className="mt-4 p-3 w-full bg-[var(--primary-blue)] text-white rounded-lg shadow-md hover:bg-[var(--hover-blue)] transition" onClick={() => setShowEventForm((prev) => !prev)}>
          {showEventForm ? "✖ Close Event Form" : "➕ Add Event"}
        </button>

        {/* Event Input Form */}
        {showEventForm && (
          <div className="mt-3 p-4 bg-gray-100 rounded-lg shadow-md">
            <input type="text" placeholder="Event description..." className="p-2 border rounded w-full mb-3 text-sm" value={eventText} onChange={(e) => setEventText(e.target.value)} />
            <input type="time" className="p-2 border rounded w-full mb-3 text-sm" value={eventTime} onChange={(e) => setEventTime(e.target.value)} />
            <select className="p-2 border rounded w-full text-sm" value={eventCategory} onChange={(e) => setEventCategory(e.target.value)}>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button className="mt-3 p-2 w-full bg-[var(--hover-blue)] text-white rounded-lg hover:bg-blue-600 transition" onClick={handleAddEvent}>Save Event</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModalCalendar;
