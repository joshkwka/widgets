interface ModalProfileDetailsProps {
  onClose: () => void;
}

const ModalProfileDetails = ({ onClose }: ModalProfileDetailsProps) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <p className="text-lg">This is the profile details modal.</p>
      <button className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition" onClick={onClose}>
        Back
      </button>
    </div>
  );
};

export default ModalProfileDetails;
