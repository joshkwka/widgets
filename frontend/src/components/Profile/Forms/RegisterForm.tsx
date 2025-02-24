import { useState } from "react";
import { registerUser } from "../../../api/auth";

interface RegisterFormProps {
    onToggle: () => void;
    onRegister: () => void;
}

const RegisterForm = ({ onToggle, onRegister }: RegisterFormProps) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [error, setError] = useState("");

    const handleRegister = async () => {
        try {
            await registerUser(username, email, password, firstName, lastName);
            onRegister();
        } catch (err) {
            setError("Registration failed. Try again.");
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <input
                type="text"
                placeholder="User Name"
                className="p-2 border rounded w-full"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="text"
                placeholder="First Name"
                className="p-2 border rounded w-full"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />
            <input
                type="text"
                placeholder="Last Name"
                className="p-2 border rounded w-full"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />
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
                className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                onClick={handleRegister}
            >
                Register
            </button>
            <button className="text-blue-500 hover:underline" onClick={onToggle}>
                Already have an account? Log in
            </button>
        </div>
    );
};

export default RegisterForm;
