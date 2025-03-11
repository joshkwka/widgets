import { useState, useEffect, useRef } from "react";
import BaseWidget from "../BaseWidget";
import Clock from "react-clock";
import DragHandle from "./Helper/DragHandle";
import "react-clock/dist/Clock.css";
import { fetchWidgetPreferences, saveWidgetPreferences } from "../../api/auth";

// Function to get the user's system timezone
const getUserTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

const timezones = [
  { label: "Afghanistan (AFT, UTC+04:30)", value: "Asia/Kabul" },
  { label: "Alaska (AKST, UTC-09:00)", value: "America/Anchorage" },
  { label: "Atlantic Time (AST, UTC-04:00)", value: "America/Halifax" },
  { label: "Australian Eastern (AET, UTC+10:00)", value: "Australia/Sydney" },
  { label: "Azores (AZOT, UTC-01:00)", value: "Atlantic/Azores" },
  { label: "Bangladesh (BST, UTC+06:00)", value: "Asia/Dhaka" },
  { label: "Brazil (BRT, UTC-03:00)", value: "America/Sao_Paulo" },
  { label: "Central Australia (ACST, UTC+09:30)", value: "Australia/Adelaide" },
  { label: "Central European Time (CET, UTC+01:00)", value: "Europe/Berlin" },
  { label: "Central Time (CST, UTC-06:00)", value: "America/Chicago" },
  { label: "Eastern Time (EST, UTC-05:00)", value: "America/New_York" },
  { label: "Pacific Time (PST, UTC-08:00)", value: "America/Los_Angeles" },
];

export default function ClockWidget({ id }: { id: string }) {
  const [time, setTime] = useState(new Date());
  const [timezone, setTimezone] = useState<string | null>(null);
  const [analogMode, setAnalogMode] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState(100);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch preferences from API on mount
  useEffect(() => {
    const loadPreferences = async () => {
      const preferences = await fetchWidgetPreferences(id);
      const settings = preferences.settings
      if (settings) {
        console.log("preferences exist!");
        setTimezone(settings.timezone || getUserTimezone());
        setAnalogMode(settings.analogMode ?? false);
      } else {
        // Save default preferences only for new widgets
        console.log("setting defaults!");
        const defaultTimezone = getUserTimezone();
        setTimezone(defaultTimezone);
        await saveWidgetPreferences(id, "clock", {
          timezone: defaultTimezone,
          analogMode: false,
        });
      }
    };

    loadPreferences();
  }, [id]);

  // Detect widget resize and update clock size dynamically
  useEffect(() => {
    const updateSize = () => {
      if (widgetRef.current) {
        const width = widgetRef.current.clientWidth;
        const height = widgetRef.current.clientHeight;
        setSize(Math.min(width, height) * 0.75);
      }
    };

    updateSize();
    const resizeObserver = new ResizeObserver(updateSize);
    if (widgetRef.current) resizeObserver.observe(widgetRef.current);

    return () => resizeObserver.disconnect();
  }, []);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BaseWidget id={id} defaultSettings={{ timezone: timezone || getUserTimezone() }}>
      <div ref={widgetRef} className="relative flex flex-col w-full h-full">
        {/* HEADER CONTAINER */}
        <div className="flex justify-between items-center px-3 py-2 border-b border-[var(--border)]">
          {/* Timezone Dropdown */}
          <div className="relative pointer-events-auto">
            <div
              className="cursor-pointer text-sm text-[var(--text-dark)] hover:text-[var(--hover-blue)] transition-colors duration-200"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              {timezones.find((tz) => tz.value === timezone)?.label.split(" ")[0] || "Select"}
            </div>
          </div>

          {dropdownOpen && (
            <div
              className="absolute pointer-events-auto left-0 top-8 w-48 bg-[var(--widget-bg)] text-[var(--foreground)] border border-[var(--border)] shadow-[var(--box-shadow)] rounded-md max-h-60 overflow-auto z-10"
              ref={dropdownRef}
            >
              {timezones.map((tz) => (
                <div
                  key={tz.value}
                  className="px-3 py-2 cursor-pointer hover:bg-[var(--hover-blue)] hover:text-[var(--hover-text)] transition-colors duration-200"
                  onClick={() => {
                    setTimezone(tz.value);
                    saveWidgetPreferences(id, "clock", { timezone: tz.value });
                    setDropdownOpen(false);
                  }}
                >
                  {tz.label}
                </div>
              ))}
            </div>
          )}

          {/* Drag Handle */}
          <DragHandle />

          {/* Toggle Switch */}
          <div
            className="w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all bg-[var(--border)] pointer-events-auto"
            onClick={() => {
              const newMode = !analogMode;
              setAnalogMode(newMode);
              saveWidgetPreferences(id, "clock", { analogMode: newMode });
            }}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${analogMode ? "translate-x-6" : ""}`} />
          </div>
        </div>

        {/* MAIN CONTAINER */}
        <div className="flex-grow flex items-center justify-center">
          {analogMode ? (
            <Clock value={time} size={size} />
          ) : (
            <span
              className="font-bold text-[var(--foreground)]"
              style={{
                fontSize: `${size * 0.25}px`, 
              }}
            >
              {time.toLocaleTimeString("en-US", { timeZone: timezone || getUserTimezone() })}
            </span>
          )}
        </div>

      </div>
    </BaseWidget>
  );
}
