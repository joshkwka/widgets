import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ResetPassword = () => {
    const { uid, token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");

    const handleResetPassword = async () => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/reset-password/`, { uid, token, password });
            alert("Password reset successful! Redirecting to login...");
            navigate("/login");
        } catch (err) {
            alert("Failed to reset password.");
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <input
                type="password"
                placeholder="New Password"
                className="p-2 border rounded w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                onClick={handleResetPassword}
            >
                Reset Password
            </button>
        </div>
    );
};

export default ResetPassword;
