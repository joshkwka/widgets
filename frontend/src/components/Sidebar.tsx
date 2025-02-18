import { useState } from "react";
import LayoutSidebar from "./LayoutSidebar";
import Modal from "./Modal";
import ModalSettings from "./Settings/ModalSettings";
import ModalCalendar from "./Calendar/ModalCalendar";
import ModalProfile from "./Profile/ModalProfile";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [modalContent, setModalContent] = useState<string | null>(null);

  // Function to render the correct modal component
  const renderModalContent = () => {
    switch (modalContent) {
      case "Settings":
        return <ModalSettings />;
      case "Calendar":
        return <ModalCalendar />;
      case "Profile":
        return <ModalProfile />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Main Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 p-4 backdrop-blur-md shadow-lg z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          backgroundColor: "var(--sidebar-background)",
          color: "var(--sidebar-foreground)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              toggleSidebar();
              setIsLayoutOpen(false);
            }}
            className="text-[var(--sidebar-foreground)] text-lg hover:text-gray-400 transition"
          >
            ✕
          </button>
        </div>

        {/* Home Button - Toggles LayoutSidebar */}
        <button
          className="p-2 my-2 rounded transition w-full"
          onClick={() => setIsLayoutOpen((prev) => !prev)}
        >
          Home
        </button>

        {/* Other Buttons - Open Specific Modals */}
        {["Calendar", "Settings", "Profile"].map((item) => (
          <button
            key={item}
            className="p-2 my-2 rounded transition w-full"
            onClick={() => setModalContent(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Render LayoutSidebar */}
      {isOpen && <LayoutSidebar isOpenLayout={isLayoutOpen} />}

      {/* Render the selected modal */}
      <Modal isOpen={!!modalContent} onClose={() => setModalContent(null)} title={modalContent || ""}>
        {renderModalContent()}
      </Modal>
    </>
  );
}
