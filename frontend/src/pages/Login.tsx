// /src/pages/Login.tsx
import { useState } from "react";
import { loginUser } from "../api/auth";
import Swal from "sweetalert2";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      const res = await loginUser(email, password);
      localStorage.setItem("token", res.data.access);
      Swal.fire("Success", "Logged in successfully!", "success");
    } catch {
      Swal.fire("Error", "Invalid login", "error");
    }
  };

  return (
    <div className="p-4">
      <input className="border p-2" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input className="border p-2 mt-2" placeholder="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
      <button className="bg-blue-500 text-white p-2 mt-2" onClick={handleSubmit}>Login</button>
    </div>
  );
};

export default Login;
