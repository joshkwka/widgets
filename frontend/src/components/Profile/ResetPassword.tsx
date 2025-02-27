import { useState } from "react";
import { resetPassword } from "../../api/auth";

interface ResetPasswordProps {
    token: string | null; // Token now passed as a prop
}

const ResetPassword = ({ token }: ResetPasswordProps) => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            setMessage("Invalid reset link.");
            return;
        }
        if (password !== confirmPassword) {
            setMessage("Passwords do not match.");
            return;
        }
        try {
            await resetPassword(token, password);
            setMessage("Password reset successful!");
        } catch (error) {
            setMessage("Error resetting password.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-2">Reset Password</h2>
            <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-2 border rounded mb-2"
            />
            <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-2 border rounded mb-2"
            />
            <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                Reset Password
            </button>
            {message && <p className="mt-2 text-sm text-gray-600">{message}</p>}
        </form>
    );
};

export default ResetPassword;
