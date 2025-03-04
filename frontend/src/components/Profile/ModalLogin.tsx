import { useState, useEffect } from "react";
import LoginForm from "./Forms/LoginForm";
import RegisterForm from "./Forms/RegisterForm";
import ForgotPasswordForm from "./Forms/ForgotPasswordForm";
import { useAuth } from "../../context/AuthContext";

interface ModalLoginProps {
    onClose: () => void;
}

const ModalLogin = ({ onClose }: ModalLoginProps) => {
    const { setIsLoggedIn, setUser } = useAuth();
    const [view, setView] = useState<"login" | "register" | "forgot">("login");
    const [emailVerifiedMessage, setEmailVerifiedMessage] = useState<string | null>(null);

    const handleLoginSuccess = (userData: { user: { first_name: string; last_name: string; email: string } }) => {
        setIsLoggedIn(true);
        setUser(userData.user);
        onClose();
    };

    useEffect(() => {
        const handleEmailVerified = () => {
            setEmailVerifiedMessage("Email Verified! You can now log in.");
            setView("login");
        };

        window.addEventListener("email-verified", handleEmailVerified);
        return () => window.removeEventListener("email-verified", handleEmailVerified);
    }, []);

    return (
        <div className="p-4">
            {emailVerifiedMessage && (
                <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
                    {emailVerifiedMessage}
                </div>
            )}
            {view === "register" ? (
                <RegisterForm onToggle={() => setView("login")} />
            ) : view === "forgot" ? (
                <>
                    <ForgotPasswordForm />
                    <div className="flex justify-center">
                        <button className="text-blue-500 hover:underline mt-2" onClick={() => setView("login")}>
                            Back to Login
                        </button>
                    </div>
                </>
            ) : (
                <>
                    <LoginForm onToggle={() => setView("register")} onLogin={handleLoginSuccess} />
                    <div className="flex justify-center">
                        <button className="text-blue-500 hover:underline mt-2" onClick={() => setView("forgot")}>
                            Forgot Password?
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ModalLogin;
