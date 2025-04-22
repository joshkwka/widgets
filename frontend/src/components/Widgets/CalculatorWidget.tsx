import { useState } from "react";
import BaseWidget from "../BaseWidget";
import DragHandle from "./Helper/DragHandle";

export default function CalculatorWidget({ id }: { id: string }) {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");

  const handleInput = (value: string) => {
    if (value === "C") {
      setInput("");
      setResult("");
    } else if (value === "⌫") {
      setInput((prev) => prev.slice(0, -1));
    } else if (value === "=") {
      try {
        // eslint-disable-next-line no-eval
        const evalResult = eval(input.replace(/√/g, "Math.sqrt").replace(/\^/g, "**"));
        setResult(String(evalResult));
      } catch {
        setResult("Error");
      }
    } else {
      setInput((prev) => prev + value);
    }
  };

  const buttons = [
    "7", "8", "9", "/", "√",
    "4", "5", "6", "*", "^",
    "1", "2", "3", "-", "⌫",
    "0", ".", "=", "+", "C"
  ];

  return (
    <BaseWidget id={id} defaultSettings={{}}>
      <div className="w-full h-full flex flex-col gap-2">
        {/* Header */}
        <div className="relative px-3 py-2 border-b border-[var(--border)]">
            <span className="font-semibold text-[var(--foreground)]">Calculator</span>
            <DragHandle />
        </div>
        {/* Display */}
        <div className="bg-[var(--widget-bg)] text-[var(--foreground)] p-3 rounded text-right">
          <div className="text-sm text-gray-400 break-all">{input || "0"}</div>
          <div className="text-xl font-bold break-all">{result}</div>
        </div>

        {/* Buttons */}
        <div className="grid grid-cols-5 gap-2 px-3 py-2">
          {buttons.map((btn) => (
            <button
              key={btn}
              onClick={() => handleInput(btn)}
              className="py-2 rounded bg-[var(--border)] hover:bg-[var(--hover-blue)] text-[var(--foreground)] text-sm font-medium transition"
            >
              {btn}
            </button>
          ))}
        </div>
      </div>
    </BaseWidget>
  );
}