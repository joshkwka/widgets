const Modal = ({ content, onClose }: { content: string; onClose: () => void }) => {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white p-6 rounded shadow-lg w-1/3">
          <h2 className="text-xl font-bold">{content}</h2>
          <p>This is a placeholder for the {content} modal.</p>
          <button className="mt-4 p-2 bg-red-500 text-white rounded" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    );
  };
  
  export default Modal;
  