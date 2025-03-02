import { useState } from "react";
import { updateUserProfile, deleteUserAccount } from "../../../api/auth";
import { useAuth } from "../../../context/AuthContext";

interface UpdateProfileFormProps {
    onClose: () => void;
}

const UpdateProfileForm = ({ onClose }: UpdateProfileFormProps) => {
    const { user, setUser, setIsLoggedIn } = useAuth();

    const [firstName, setFirstName] = useState(user?.first_name ?? "");
    const [lastName, setLastName] = useState(user?.last_name ?? "");
    const [message, setMessage] = useState<string | null>(null);

    const handleUpdateProfile = async () => {
        try {
            const data = await updateUserProfile(firstName, lastName);
            setUser(data.user);
            setMessage("Profile updated successfully!");
        } catch (error) {
            setMessage("Failed to update profile. Please try again.");
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm("Are you sure you want to delete your account? This action is irreversible.");
        if (confirmed) {
            try {
                await deleteUserAccount();
                setIsLoggedIn(false);
                setUser(null);
                window.dispatchEvent(new Event("logout"));  // To trigger global logout handling
                onClose();  // Close modal after deletion
            } catch (error) {
                setMessage("Failed to delete account. Please try again.");
            }
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4 p-4 bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold">Update Profile</h2>
            <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="p-2 border rounded w-full"
            />
            <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="p-2 border rounded w-full"
            />
            <button
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg"
                onClick={handleUpdateProfile}
            >
                Save Changes
            </button>
            <button
                className="w-full px-4 py-2 bg-red-500 text-white rounded-lg"
                onClick={handleDeleteAccount}
            >
                Delete Account
            </button>
            {message && (
                <p className={message.includes("success") ? "text-green-500" : "text-red-500"}>
                    {message}
                </p>
            )}
            <button
                className="w-full px-4 py-2 bg-gray-500 text-white rounded-lg"
                onClick={onClose}
            >
                Back to Profile
            </button>
        </div>
    );
};

export default UpdateProfileForm;
