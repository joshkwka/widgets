import { useState } from "react";
import Modal from "../Modal";
import ModalLogin from "./ModalLogin";
import ModalProfileDetails from "./ModalProfileDetails";

interface ModalProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalProfile = ({ isOpen, onClose }: ModalProfileProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={isLoggedIn ? "Profile" : "Log In"}>
        {isLoggedIn ? (
          <div className="flex flex-col items-center space-y-4">
            <button
              className="px-6 py-3 bg-[var(--primary-blue)] text-white rounded-lg hover:bg-[var(--hover-blue)] transition"
              onClick={() => setShowProfileDetails(true)}
            >
              Go to Profile
            </button>
          </div>
        ) : (
          <ModalLogin onLogin={() => setIsLoggedIn(true)} />
        )}
      </Modal>

      {showProfileDetails && (
        <Modal isOpen={showProfileDetails} onClose={() => setShowProfileDetails(false)} title="Profile">
          <ModalProfileDetails onLogout={() => setIsLoggedIn(false)} />
        </Modal>
      )}
    </>
  );
};

export default ModalProfile;
