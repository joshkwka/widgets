interface LoginFormProps {
    onToggle: () => void;
    onLogin: () => void; // Add this prop
  }
  
  const LoginForm = ({ onToggle, onLogin }: LoginFormProps) => {
    return (
      <div className="flex flex-col items-center space-y-4">
        <input type="email" placeholder="Email" className="p-2 border rounded w-full" />
        <input type="password" placeholder="Password" className="p-2 border rounded w-full" />
        <button
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          onClick={onLogin} // Calls onLogin when the user logs in
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
  