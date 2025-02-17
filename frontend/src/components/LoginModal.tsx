import { useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";

const LoginModal = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await axios.post("http://127.0.0.1:8000/users/login/", { 
        email, 
        password 
      });
      localStorage.setItem("token", response.data.access);
      Swal.fire("Success", "Logged in successfully!", "success");
    } catch (error) {
      Swal.fire("Error", "Invalid credentials", "error");
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="email"
        placeholder="Email"
        className="p-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="p-2 border rounded mt-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button 
        className="bg-blue-500 text-white p-2 rounded mt-2" 
        onClick={handleLogin}>
        Login
      </button>
    </div>
  );
};

export default LoginModal;
