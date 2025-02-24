import { useState } from "react";
import LoginForm from "./Forms/LoginForm";
import RegisterForm from "./Forms/RegisterForm";
import ForgotPasswordForm from "./Forms/ForgotPasswordForm"; // New import

interface ModalLoginProps {
  onClose: () => void;
  onLogin: () => void;
}

const ModalLogin = ({ onClose, onLogin }: ModalLoginProps) => {
  const [view, setView] = useState<"login" | "register" | "forgot">("login");

  return (
    <div>
      {view === "register" ? (
        <RegisterForm onToggle={() => setView("login")} onRegister={onLogin} />
      ) : view === "forgot" ? (
        <ForgotPasswordForm onToggle={() => setView("login")} />
      ) : (
        <LoginForm
          onToggle={() => setView("register")}
          onLogin={onLogin}
        />
      )}
      {view === "login" && (
        <button className="text-blue-500 hover:underline mt-2" onClick={() => setView("forgot")}>
          Forgot Password?
        </button>
      )}
    </div>
  );
};

export default ModalLogin;
