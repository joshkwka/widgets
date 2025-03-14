import { useState, useEffect } from "react";
import ModalLogin from "./ModalLogin";
import ModalProfileDetails from "./ModalProfileDetails";
import UpdateProfileForm from "./Forms/UpdateProfileForm";  
import { logoutUser } from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

interface ModalProfileProps {
    isOpen: boolean;
    onClose: () => void;
}

const ModalProfile = ({ isOpen, onClose }: ModalProfileProps) => {
    const { isLoggedIn, user, setIsLoggedIn, setUser } = useAuth();
    const [view, setView] = useState<"profile" | "login" | "details" | "update">("profile");
    const [autoOpenReset, setAutoOpenReset] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            setView("profile");
        } else {
            setView("login");
        }
    }, [isLoggedIn, user]);

    useEffect(() => {
        const handleMagicLogin = () => {
            setView("details");
            setAutoOpenReset(true);
        };
        window.addEventListener("magic-login-success", handleMagicLogin);
        return () => {
            window.removeEventListener("magic-login-success", handleMagicLogin);
        };
    }, []);

    const handleLogout = async () => {
        await logoutUser();
        setIsLoggedIn(false);
        setUser(null);
        setView("login");
        onClose();
    };

    return (
        <div>
            {view === "profile" && isLoggedIn ? (
                <div className="flex flex-col items-center space-y-4">
                    <p className="text-lg">Welcome, {user?.first_name} {user?.last_name}!</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>

                    <button
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        onClick={() => setView("update")}
                    >
                        Update Profile
                    </button>

                    <button
                        className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        onClick={() => setView("details")}
                    >
                        Reset Password
                    </button>

                    <button
                        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        onClick={handleLogout}
                    >
                        Log Out
                    </button>
                </div>
            ) : view === "profile" ? (
                <button
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                    onClick={() => setView("login")}
                >
                    Log In
                </button>
            ) : view === "login" ? (
                <ModalLogin onClose={() => setView("profile")} />
            ) : view === "details" ? (
                <ModalProfileDetails onClose={() => setView("profile")} />
            ) : view === "update" ? (
                <UpdateProfileForm onClose={() => setView("profile")} />
            ) : null}
        </div>
    );
};

export default ModalProfile;
