import { useState, useEffect } from "react";
import Modal from "../Modal";
import ModalLogin from "./ModalLogin";
import ModalProfileDetails from "./ModalProfileDetails";
import { fetchUserProfile, logoutUser } from "../../api/auth";

interface ModalProfileProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalProfile = ({ isOpen, onClose }: ModalProfileProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ first_name: string; email: string } | null>(null);
  const [view, setView] = useState<"profile" | "login" | "details">("profile");

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetchUserProfile();
          setUser(response.data);
          setIsLoggedIn(true);
        } catch {
          setIsLoggedIn(false);
          setUser(null);
        }
      }
    };
    if (isOpen) checkAuth();
  }, [isOpen]);

  const handleLogout = () => {
    logoutUser();
    setIsLoggedIn(false);
    setUser(null);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={view === "login" ? "Log In" : view === "details" ? "Profile Details" : "Profile"}>
      {view === "profile" && isLoggedIn ? (
        <div className="flex flex-col items-center space-y-4">
          <p className="text-lg">Welcome, {user?.first_name}!</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition" onClick={() => setView("details")}>
            Go to Profile
          </button>
          <button className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition" onClick={handleLogout}>
            Log Out
          </button>
        </div>
      ) : view === "profile" ? (
        <button className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition" onClick={() => setView("login")}>
          Log In
        </button>
      ) : view === "login" ? (
        <ModalLogin onClose={() => setView("profile")} onLogin={() => { setIsLoggedIn(true); setView("profile"); }} />
      ) : view === "details" ? (
        <ModalProfileDetails onClose={() => setView("profile")} />
      ) : null}
    </Modal>
  );
};

export default ModalProfile;
