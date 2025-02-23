import { useState } from "react";
import LoginForm from "./Forms/LoginForm";
import RegisterForm from "./Forms/RegisterForm";

interface ModalLoginProps {
  onLogin: () => void;
}

const ModalLogin = ({ onLogin }: ModalLoginProps) => {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div className="flex flex-col items-center space-y-4">
      {isRegistering ? (
        <RegisterForm onToggle={() => setIsRegistering(false)} />
      ) : (
        <LoginForm onToggle={() => setIsRegistering(true)} onLogin={onLogin} />
      )}
    </div>
  );
};

export default ModalLogin;
