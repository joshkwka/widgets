import { useState } from "react";
import Sidebar from "./Sidebar";

export default function SidebarButton() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)} />

      {/* Hamburger Button */}
      {!isSidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 w-10 h-10 flex items-center justify-center rounded-full bg-[var(--sidebar-background)] hover:bg-[var(--sidebar-hover-background)] transition-all duration-300 ease-in-out z-20 shadow-lg"
        >
          ☰
        </button>
      )}
    </div>
  );
}
