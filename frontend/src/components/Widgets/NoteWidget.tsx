import { useEffect, useState } from "react";
import BaseWidget from "../BaseWidget";
import DragHandle from "./Helper/DragHandle";
import { fetchWidgetPreferences, saveWidgetPreferences } from "../../api/auth";

interface NoteItem {
  id: string;
  text: string;
  indent?: number;
}

export default function NotepadWidget({ id }: { id: string }) {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [input, setInput] = useState("");
  const [title, setTitle] = useState("Notepad");
  const [editingTitle, setEditingTitle] = useState(false);

  useEffect(() => {
    const load = async () => {
      const prefs = await fetchWidgetPreferences(id);
      setNotes(prefs.settings?.notes || []);
      setTitle(prefs.settings?.title || "Notepad");
    };
    load();
  }, [id]);

  const saveNotes = (updated: NoteItem[]) => {
    setNotes(updated);
    saveWidgetPreferences(id, "notepad", { notes: updated, title });
  };

  const saveTitle = (newTitle: string) => {
    setTitle(newTitle);
    saveWidgetPreferences(id, "notepad", { notes, title: newTitle });
  };

  const handleAdd = () => {
    if (!input.trim()) return;
    const newItem: NoteItem = { id: crypto.randomUUID(), text: input, indent: 0 };
    saveNotes([...notes, newItem]);
    setInput("");
  };

  const handleDelete = (itemId: string) => {
    const updated = notes.filter((item) => item.id !== itemId);
    saveNotes(updated);
  };

  const indentNote = (itemId: string, direction: "left" | "right") => {
    const updated = notes.map((item) => {
      if (item.id === itemId) {
        const currentIndent = item.indent || 0;
        const newIndent =
          direction === "right" ? currentIndent + 1 : Math.max(0, currentIndent - 1);
        return { ...item, indent: newIndent };
      }
      return item;
    });
    saveNotes(updated);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newNotes = [...notes];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= notes.length) return;

    [newNotes[index], newNotes[targetIndex]] = [
      newNotes[targetIndex],
      newNotes[index],
    ];
    saveNotes(newNotes);
  };

  return (
    <BaseWidget id={id} defaultSettings={{ notes: [], title: "Notepad" }}>
      <div className="w-full h-full flex flex-col gap-2">
        {/* Header */}
        <div className="flex justify-between items-center px-3 py-2 border-b border-[var(--border)]">
          {editingTitle ? (
            <input
              className="text-md font-semibold bg-transparent border-b border-[var(--border)] text-[var(--foreground)] focus:outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => {
                setEditingTitle(false);
                saveTitle(title);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setEditingTitle(false);
                  saveTitle(title);
                }
              }}
              autoFocus
            />
          ) : (
            <button
              onClick={() => setEditingTitle(true)}
              className="text-left text-md font-semibold text-[var(--foreground)] cursor-pointer bg-transparent border-none focus:outline-none"
            >
              {title}
            </button>
          )}
          <DragHandle />
        </div>

        {/* Input */}
        <div className="flex px-3 gap-2">
          <input
            className="flex-1 rounded border border-[var(--border)] bg-transparent text-[var(--foreground)] px-2 py-1 text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Add a note..."
          />
          <button
            className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={handleAdd}
          >
            Add
          </button>
        </div>

        {/* Note List */}
        <ul className="flex flex-col gap-1 px-3 py-2 overflow-auto">
          {notes.map((item, index) => (
            <li
              key={item.id}
              className="relative group flex items-start justify-between"
              style={{ paddingLeft: `${(item.indent || 0) * 16 + 20}px` }}
            >
              {/* Arrows */}
              <div className="absolute left-1 top-0 flex flex-col items-center gap-[1px] opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => moveItem(index, "up")}
                  disabled={index === 0}
                  className="text-[10px] leading-none text-gray-400 hover:text-gray-600 disabled:opacity-0"
                >
                  ▲
                </button>
                <button
                  onClick={() => moveItem(index, "down")}
                  disabled={index === notes.length - 1}
                  className="text-[10px] leading-none text-gray-400 hover:text-gray-600 disabled:opacity-0"
                >
                  ▼
                </button>
              </div>

              {/* Bullet + Text */}
              <div className="flex items-start gap-2 flex-1">
                <span className="text-md text-[var(--foreground)] leading-[1.25rem]">•</span>
                <span className="text-md text-[var(--foreground)] leading-[1.25rem] select-none">
                  {item.text}
                </span>
              </div>

              {/* Indent/Delete */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-[2px]">
                {item.indent! > 0 && (
                  <button
                    onClick={() => indentNote(item.id, "left")}
                    className="text-sm text-gray-400 hover:text-gray-600"
                  >
                    ◀
                  </button>
                )}
                <button
                  onClick={() => indentNote(item.id, "right")}
                  className="text-sm text-gray-400 hover:text-gray-600"
                >
                  ▶
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </BaseWidget>
  );
}
