import { useState, useEffect } from "react";
import { fetchUserProfile, logoutUser } from "../../api/auth";
import ResetPassword from "./ResetPassword";

interface ModalProfileDetailsProps {
  onClose: () => void;
  resetToken?: string | null;
}

const ModalProfileDetails = ({ onClose, resetToken }: ModalProfileDetailsProps) => {
  const [user, setUser] = useState<{ first_name: string; last_name: string; email: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userProfile = await fetchUserProfile();
        if (userProfile) {
          setUser(userProfile);
        } else {
          setError("Failed to load profile. Please try again.");
        }
      } catch (err) {
        setError("Failed to load profile. Please try again.");
      }
    };

    loadUserProfile();
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-white rounded-lg shadow-lg">
      <ResetPassword token={resetToken || null} />
      <div className="flex space-x-4">
        <button
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
          onClick={onClose}
        >
          Back
        </button>
      </div>
      {error && <p className="text-red-500">{error}</p>}
    </div>
  );
};

export default ModalProfileDetails;
