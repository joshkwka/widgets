import { useState } from "react";
import Modal from "../../Modal"; 

const availableWidgets = [
  { type: "clock", name: "Clock Widget" },
  { type: "todo", name: "To-Do List" },
  { type: "pomodoro", name: "Pomodoro Timer" },
  { type: "notepad", name: "Notepad" },
  { type: "calculator", name: "Calculator" },
  { type: "weather", name: "Weather" },
  { type: "bookmarks", name: "Bookmarks" },
];

export default function AddWidgetButton({ 
  onAddWidget, 
  existingWidgets 
}: { 
  onAddWidget: (type: string) => void; 
  existingWidgets: string[];
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      {/* "+" button */}
      <div
        className="fixed bottom-10 right-6 w-12 h-12 flex items-center justify-center rounded-full bg-[var(--sidebar-background)] hover:bg-[var(--sidebar-hover-background)] z-20 shadow-lg"
        onClick={() => setShowModal(true)}
      >
        +
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Manage Widgets">
        <div className="flex gap-8 justify-between">
          
          {/* Add a Widget (Left) */}
          <div className="flex-1">
            <h3 className="text-md font-semibold text-[var(--foreground-light)] mb-2">Add a Widget:</h3>
            <div className="flex flex-col gap-2">
              {availableWidgets.map((widget) => (
                <button
                  key={widget.type}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-[var(--hover-blue)] transition"
                  onClick={() => {
                    onAddWidget(widget.type);
                    setShowModal(false);
                  }}
                >
                  {widget.name}
                </button>
              ))}
            </div>
          </div>

          {/* Current Widgets (Right) */}
          <div className="flex-1">
            <h3 className="text-md font-semibold text-[var(--foreground)] mb-2">Current Widgets:</h3>
            {existingWidgets.length > 0 ? (
              <ul className="list-disc ml-4 text-md text-[var(--foreground)]">
                {existingWidgets.map((widget, idx) => (
                  <li key={idx}>{widget}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[var(--foreground)] text-md">No widgets added.</p>
            )}
          </div>

        </div>
      </Modal>
    </>
  );
}
