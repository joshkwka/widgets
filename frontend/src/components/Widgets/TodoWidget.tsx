import { useEffect, useState } from "react";
import BaseWidget from "../BaseWidget";
import DragHandle from "./Helper/DragHandle";
import {
  fetchWidgetPreferences,
  saveWidgetPreferences,
} from "../../api/auth";

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  indent?: number;
}

export default function TodoWidget({ id }: { id: string }) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [input, setInput] = useState("");
  const [title, setTitle] = useState("To-Do List");
  const [editingTitle, setEditingTitle] = useState(false);

  useEffect(() => {
    const load = async () => {
      const prefs = await fetchWidgetPreferences(id);
      setTodos(prefs.settings?.todos || []);
      setTitle(prefs.settings?.title || "To-Do List");
    };
    load();
  }, [id]);

  const saveTodos = (updated: TodoItem[]) => {
    setTodos(updated);
    saveWidgetPreferences(id, "todo", { todos: updated, title });
  };

  const saveTitle = (newTitle: string) => {
    setTitle(newTitle);
    saveWidgetPreferences(id, "todo", { todos, title: newTitle });
  };

  const handleAdd = () => {
    if (!input.trim()) return;
    const newItem: TodoItem = {
      id: crypto.randomUUID(),
      text: input,
      done: false,
      indent: 0,
    };
    saveTodos([...todos, newItem]);
    setInput("");
  };

  const toggleDone = (itemId: string) => {
    const updated = todos.map((item) =>
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    saveTodos(updated);
  };

  const handleDelete = (itemId: string) => {
    const updated = todos.filter((item) => item.id !== itemId);
    saveTodos(updated);
  };

  const indentTask = (itemId: string, direction: "left" | "right") => {
    const updated = todos.map((item) => {
      if (item.id === itemId) {
        const currentIndent = item.indent || 0;
        const newIndent =
          direction === "right" ? currentIndent + 1 : Math.max(0, currentIndent - 1);
        return { ...item, indent: newIndent };
      }
      return item;
    });
    saveTodos(updated);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    const newTodos = [...todos];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= todos.length) return;

    [newTodos[index], newTodos[targetIndex]] = [
      newTodos[targetIndex],
      newTodos[index],
    ];
    saveTodos(newTodos);
  };

  return (
    <BaseWidget id={id} defaultSettings={{ todos: [], title: "To-Do List" }}>
      <div className="w-full h-full flex flex-col gap-2">
        {/* Header */}
        <div className="relative px-3 py-2 border-b border-[var(--border)]">
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
            placeholder="Add new task..."
          />
          <button
            className="text-sm px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            onClick={handleAdd}
          >
            Add
          </button>
        </div>

        {/* Todo List */}
        <ul className="flex flex-col gap-1 px-3 py-2 overflow-auto">
          {todos.map((item, index) => (
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
                  disabled={index === todos.length - 1}
                  className="text-[10px] leading-none text-gray-400 hover:text-gray-600 disabled:opacity-0"
                >
                  ▼
                </button>
              </div>

              {/* Checkbox + Text aligned on top */}
              <div className="flex items-start gap-2 flex-1">
                <input
                  type="checkbox"
                  checked={item.done}
                  onChange={() => toggleDone(item.id)}
                  className="mt-[2px]"
                />
                <span
                  className={`text-md select-none leading-[1.25rem] ${
                    item.done ? "line-through text-gray-500" : "text-[var(--foreground)]"
                  }`}
                >
                  {item.text}
                </span>
              </div>

              {/* Right-side controls */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-[2px]">
                {item.indent! > 0 && (
                  <button
                    onClick={() => indentTask(item.id, "left")}
                    className="text-sm text-gray-400 hover:text-gray-600"
                  >
                    ◀
                  </button>
                )}
                <button
                  onClick={() => indentTask(item.id, "right")}
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
