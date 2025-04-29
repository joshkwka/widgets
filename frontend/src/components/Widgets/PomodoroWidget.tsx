import { useState, useEffect } from "react";
import BaseWidget from "../BaseWidget";
import DragHandle from "./Helper/DragHandle";

export default function PomodoroWidget({ id }: { id: string }) {
  const [workMinutes, setWorkMinutes] = useState(25);
  const [breakMinutes, setBreakMinutes] = useState(5);
  const [isBreak, setIsBreak] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(workMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
            if (prev <= 1) {
              const nextMode = !isBreak;
              setIsBreak(nextMode);
              setFlash(true); 
              setTimeout(() => setFlash(false), 1000); 
              return (nextMode ? breakMinutes : workMinutes) * 60;
            }
          return prev - 1;
        });
      }, 1000);
    }
  
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, isBreak, workMinutes, breakMinutes]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setSecondsLeft(workMinutes * 60);


  };

  return (
    <BaseWidget id={id} defaultSettings={{}}>
     <div className={`w-full h-full flex flex-col gap-2 ${flash ? "bg-green-400 animate-pulse" : "bg-[var(--widget-bg)]"}`}>
        {/* Header */}
        <div className="relative px-3 py-2 border-b border-[var(--border)]">
          <span className="font-semibold text-[var(--foreground)]">Pomodoro</span>
          <DragHandle />
        </div>

        {/* Timer Display */}
        <div className="flex-grow flex flex-col items-center justify-center gap-2">
          <span className="text-5xl font-bold text-[var(--foreground)]">
            {formatTime(secondsLeft)}
          </span>
          <span className="text-sm text-[var(--muted)]">
            {isBreak ? "Break Time" : "Focus Time"}
          </span>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 pb-4">
          <button
            onClick={() => setIsRunning((r) => !r)}
            className="px-4 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-1 text-sm bg-gray-400 text-white rounded hover:bg-gray-500"
          >
            Reset
          </button>
        </div>

        {/* Settings */}
        <div className="border-t border-[var(--border)] px-3 py-2">
          <div className="flex justify-between items-center text-sm mb-2 text-[var(--foreground-light)]">
            <label htmlFor="work">Focus (min)</label>
            <input
              id="work"
              type="number"
              min="1"
              max="120"
              value={workMinutes}
              onChange={(e) => setWorkMinutes(Number(e.target.value))}
              className="w-16 px-1 rounded border border-[var(--border)] bg-transparent text-right"
            />
          </div>
          <div className="flex justify-between items-center text-sm text-[var(--foreground-light)]">
            <label htmlFor="break">Break (min)</label>
            <input
              id="break"
              type="number"
              min="1"
              max="60"
              value={breakMinutes}
              onChange={(e) => setBreakMinutes(Number(e.target.value))}
              className="w-16 px-1 rounded border border-[var(--border)] bg-transparent text-right"
            />
          </div>
        </div>
      </div>
    </BaseWidget>
  );
}
