import { useState, useEffect } from "react";
import { fetchUserProfile, logoutUser } from "../../api/auth";

interface ModalProfileDetailsProps {
  onClose: () => void;
}

const ModalProfileDetails = ({ onClose }: ModalProfileDetailsProps) => {
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

  const handleLogout = () => {
    logoutUser();
    onClose(); // Close modal after logout
    window.location.reload(); // Refresh to clear state
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-4 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold">Profile Details</h2>

      {error ? (
        <p className="text-red-500">{error}</p>
      ) : user ? (
        <>
          <p className="text-lg font-medium">{user.first_name} {user.last_name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>

          <button
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            onClick={() => alert("Change password feature coming soon!")}
          >
            Change Password
          </button>

          <button
            className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            onClick={handleLogout}
          >
            Log Out
          </button>
        </>
      ) : (
        <p>Loading...</p>
      )}

      <button className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition" onClick={onClose}>
        Back
      </button>
    </div>
  );
};

export default ModalProfileDetails;
