import { useState } from "react";
import { sendMagicLoginEmail } from "../../../api/auth";

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await sendMagicLoginEmail(email);
            setMessage("Login link sent! Check your email.");
        } catch (error) {
            setMessage("Error sending link.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4">
            <h2>Forgot Password</h2>
            <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            <button type="submit">Send Reset Link</button>
            {message && <p>{message}</p>}
        </form>
    );
};

export default ForgotPasswordForm;
