import { useState } from "react";
import { useParams } from "react-router-dom";
import { resetUserPassword } from "../../api/auth";

interface ResetPasswordProps {
  onSuccess: () => void; 
}

const ResetPassword = ({ onSuccess }: ResetPasswordProps) => {
  const { uidb64, token } = useParams(); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const result = await resetUserPassword(password, uidb64, token); 

    if (result) {
      setSuccess(true);
      setTimeout(onSuccess, 2000); 
    } else {
      setError("Failed to update password.");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4 p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold">Reset Password</h2>
      {error && <p className="text-red-500">{error}</p>}
      {success ? (
        <p className="text-green-500">Password updated successfully! Returning to profile...</p>
      ) : (
        <>
          <input
            type="password"
            placeholder="New Password"
            className="p-2 border rounded w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Confirm Password"
            className="p-2 border rounded w-full"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            onClick={handleResetPassword}
          >
            Update Password
          </button>
        </>
      )}
    </div>
  );
};

export default ResetPassword;
