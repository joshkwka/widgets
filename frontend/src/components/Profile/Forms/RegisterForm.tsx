import { useState } from "react";

interface RegisterFormProps {
  onToggle: () => void; // Function to toggle to LoginForm
}

const RegisterForm = ({ onToggle }: RegisterFormProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Registering with", { firstName, lastName, email, password });
    // TODO: Call backend API to register the user
  };

  return (
    <div className="flex flex-col p-4">
      <input
        type="text"
        placeholder="First Name"
        className="p-2 border rounded w-full mb-3"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Last Name"
        className="p-2 border rounded w-full mb-3"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        className="p-2 border rounded w-full mb-3"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="p-2 border rounded w-full mb-3"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirm Password"
        className="p-2 border rounded w-full mb-3"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button
        className="p-2 w-full bg-[var(--primary-blue)] text-white rounded-lg hover:bg-[var(--hover-blue)] transition"
        onClick={handleRegister}
      >
        Sign Up
      </button>
      <p className="text-center mt-3 text-sm text-[var(--text-light)]">
        Already have an account?{" "}
        <button onClick={onToggle} className="text-[var(--primary-blue)] hover:underline">
          Log in
        </button>
      </p>
    </div>
  );
};

export default RegisterForm;
