import { useState } from "react";
import { forgotPassword } from "../../../api/auth"; // New function in auth.ts

interface ForgotPasswordFormProps {
    onToggle: () => void;
}

const ForgotPasswordForm = ({ onToggle }: ForgotPasswordFormProps) => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleForgotPassword = async () => {
        try {
            await forgotPassword(email);
            setMessage("Check your email for a password reset link.");
        } catch (err) {
            setMessage("Failed to send reset link. Try again.");
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <input
                type="email"
                placeholder="Enter your email"
                className="p-2 border rounded w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <button
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                onClick={handleForgotPassword}
            >
                Send Reset Link
            </button>
            {message && <p className="text-green-500">{message}</p>}
            <button className="text-blue-500 hover:underline" onClick={onToggle}>
                Back to login
            </button>
        </div>
    );
};

export default ForgotPasswordForm;
