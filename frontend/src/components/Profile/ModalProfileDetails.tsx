interface ModalProfileDetailsProps {
    onLogout: () => void;
  }
  
  const ModalProfileDetails = ({ onLogout }: ModalProfileDetailsProps) => {
    return (
      <div className="flex flex-col items-center space-y-4">
        <p className="text-[var(--text-dark)]">Welcome, User!</p>
        <button
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          onClick={onLogout}
        >
          Log Out
        </button>
      </div>
    );
  };
  
  export default ModalProfileDetails;
  