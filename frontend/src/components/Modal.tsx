import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  const [currentTitle, setCurrentTitle] = useState(title);

  // Actively listen for title prop changes
  useEffect(() => {
    setCurrentTitle(title);
  }, [title]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300">
      {/* Modal Container */}
      <div className="bg-[var(--widget-bg)] text-[var(--foreground)] p-6 rounded-lg shadow-lg w-100 max-w-full transform transition-all duration-300 ease-in-out scale-95">
        {/* Modal Header */}
        <div className="flex justify-between items-center">
          {currentTitle && <h2 className="text-lg font-semibold mr-4 ">{currentTitle}</h2>}
          <button onClick={onClose} className="text-xl text-[var(--text-dark)] hover:text-red-500 transition">
            ✕
          </button>
        </div>

        {/* Modal Content */}
        <div className="mt-4">{children}</div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
