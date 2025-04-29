import { useState, useEffect } from "react";
import LayoutSidebar from "./LayoutSidebar";
import Modal from "./Modal";
import ModalSettings from "./Settings/ModalSettings";
import ModalCalendar from "./Calendar/ModalCalendar";
import ModalProfile from "./Profile/ModalProfile";
import ModalLogin from "./Profile/ModalLogin"; 
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [modalContent, setModalContent] = useState<string | null>(null);
  const [modalTitle, setModalTitle] = useState<string | null>(null);  // New State
  const { isLoggedIn } = useAuth();

  // Combined function to set modal content & title
  const openModal = (content: string, title: string) => {
    setModalContent(content);
    setModalTitle(title);
  };

  // Listen for magic login events and open the profile modal automatically.
  useEffect(() => {
    const handleMagicLogin = () => {
      openModal("Profile", "Profile");
    };

    const handleEmailVerified = () => {
      openModal("Login", "Login");
    };

    window.addEventListener("magic-login-success", handleMagicLogin);
    window.addEventListener("email-verified", handleEmailVerified);

    return () => {
      window.removeEventListener("magic-login-success", handleMagicLogin);
      window.removeEventListener("email-verified", handleEmailVerified);
    };
  }, []);

  // Function to render the correct modal content component
  const renderModalContent = () => {
    switch (modalContent) {
      // case "Settings":
      //   return <ModalSettings />;
      case "Calendar":
        return <ModalCalendar />;
      case "Login":
        return <ModalLogin onClose={() => setModalContent(null)} />;
      case "Profile":
        return <ModalProfile isOpen={modalContent === "Profile"} onClose={() => setModalContent(null)} />;
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
        <button
          className="p-2 my-2 rounded transition w-full"
          onClick={() => openModal("Calendar", "Calendar")}
        >
          Calendar
        </button>
        {/* <button
          className="p-2 my-2 rounded transition w-full"
          onClick={() => openModal("Settings", "Settings")}
        >
          Settings
        </button> */}

        {/* Login/Profile Button */}
        <button
          className="p-2 my-2 rounded transition w-full"
          onClick={() => {
            if (isLoggedIn) {
              openModal("Profile", "Profile");
            } else {
              openModal("Login", "Login");
            }
          }}
        >
          {isLoggedIn ? "Profile" : "Login"}
        </button>
      </div>

      {/* Render LayoutSidebar */}
      {isOpen && <LayoutSidebar isOpenLayout={isLayoutOpen} />}

      {/* Render Modal */}
      {modalContent && (
        <Modal
          isOpen={!!modalContent}
          onClose={() => setModalContent(null)}
          title={modalTitle || ""}  
        >
          {renderModalContent()}
        </Modal>
      )}
    </>
  );
}
