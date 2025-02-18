import { useState } from "react";

interface ModalLoginProps {
  onLogin: (username: string) => void;
}

const ModalLogin = ({ onLogin }: ModalLoginProps) => {
  const [username, setUsername] = useState("");

  const handleLogin = () => {
    if (username.trim()) {
      onLogin(username);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-semibold">Login</h3>
      <p>Please enter your username to continue.</p>
      <input
        type="text"
        placeholder="Username"
        className="mt-2 p-2 w-full border rounded"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <button
        className="mt-4 p-2 w-full bg-[var(--primary-blue)] text-white rounded hover:bg-[var(--hover-blue)] transition"
        onClick={handleLogin}
      >
        Login
      </button>
    </div>
  );
};

export default ModalLogin;
