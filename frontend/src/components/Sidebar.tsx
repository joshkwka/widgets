import { useState } from "react";
import LayoutSidebar from "./LayoutSidebar";
import Modal from "./Modal";

const Sidebar = () => {
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");

  return (
    <div className="h-screen w-64 bg-gray-800 text-white flex flex-col p-4">
      {/* Home Button - Opens Layout Sidebar */}
      <button
        className="p-2 my-2 bg-gray-700 hover:bg-gray-600 rounded"
        onClick={() => setIsLayoutOpen(!isLayoutOpen)}
      >
        Home
      </button>

      {/* Other Buttons - Open Placeholder Modal */}
      {["Calendar", "Settings", "Profile"].map((item) => (
        <button
          key={item}
          className="p-2 my-2 bg-gray-700 hover:bg-gray-600 rounded"
          onClick={() => setModalContent(item)}
        >
          {item}
        </button>
      ))}

      {/* Additional Sidebar for Layouts */}
      {isLayoutOpen && <LayoutSidebar />}

      {/* Modal Popup */}
      {modalContent && <Modal content={modalContent} onClose={() => setModalContent("")} />}
    </div>
  );
};

export default Sidebar;
