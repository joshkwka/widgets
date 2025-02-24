import { useState } from "react";
import LoginForm from "./Forms/LoginForm";
import RegisterForm from "./Forms/RegisterForm";

interface ModalLoginProps {
  onClose: () => void;
  onLogin: () => void;
}

const ModalLogin = ({ onClose, onLogin }: ModalLoginProps) => {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div>
      {isRegistering ? (
        <RegisterForm onToggle={() => setIsRegistering(false)} onRegister={onLogin} />
      ) : (
        <LoginForm onToggle={() => setIsRegistering(true)} onLogin={onLogin} />
      )}
    </div>
  );
};

export default ModalLogin;
