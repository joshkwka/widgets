import { useState } from "react";
import { registerUser } from "../../../api/auth";

const RegisterForm = ({ onToggle }: { onToggle: () => void }) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

    const handleRegister = async () => {
        try {
            await registerUser(firstName, lastName, email, password);
            setMessage({ type: "success", text: "Check your email for a verification link." });
        } catch {
            setMessage({ type: "error", text: "Registration failed. Try again." });
        }
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <input type="text" placeholder="First Name" className="p-2 border rounded w-full" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <input type="text" placeholder="Last Name" className="p-2 border rounded w-full" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            <input type="email" placeholder="Email" className="p-2 border rounded w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" className="p-2 border rounded w-full" value={password} onChange={(e) => setPassword(e.target.value)} />

            {message && (
                <p className={`text-${message.type === "success" ? "green" : "red"}-500`}>
                    {message.text}
                </p>
            )}

            <button className="w-full px-4 py-2 bg-green-500 text-white rounded-lg" onClick={handleRegister}>Register</button>
            <button className="text-blue-500 hover:underline" onClick={onToggle}>Already have an account? Log in</button>
        </div>
    );
};

export default RegisterForm;
