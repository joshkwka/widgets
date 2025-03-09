import { useState } from "react";
import Modal from "../../Modal"; 

const availableWidgets = [
  { type: "clock", name: "Clock Widget" },
  { type: "todo", name: "To-Do List" },
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
        className="absolute top-4 right-4 text-2xl cursor-pointer text-[var(--text-dark)] hover:text-[var(--hover-blue)] transition"
        onClick={() => setShowModal(true)}
      >
        +
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Manage Widgets">
        {/* Existing Widgets */}
        <div className="mb-4">
          <h3 className="text-md font-semibold text-[var(--foreground)]">Current Widgets:</h3>
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

        {/* Available Widgets */}
        <div className="mb-4">
          <h3 className="text-md font-semibold text-[var(--foreground-light)]">Add a Widget:</h3>
          <div className="flex flex-col gap-2">
            {availableWidgets.map((widget) => (
              <button
                key={widget.type}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-[var(--hover-blue)] transition"
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
      </Modal>
    </>
  );
}
