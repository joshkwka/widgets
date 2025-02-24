import { useState } from "react";
import { loginUser } from "../../../api/auth";

interface LoginFormProps {
    onToggle: () => void;
    onLogin: () => void;
}

const LoginForm = ({ onToggle, onLogin }: LoginFormProps) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            await loginUser(email, password);
            onLogin();
        } catch (err) {
            setError("Invalid email or password");
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <input
                type="email"
                placeholder="Email"
                className="p-2 border rounded w-full"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                className="p-2 border rounded w-full"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {error && <p className="text-red-500">{error}</p>}
            <button
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                onClick={handleLogin}
            >
                Log In
            </button>
            <button className="text-blue-500 hover:underline" onClick={onToggle}>
                Create an account
            </button>
        </div>
    );
};

export default LoginForm;
