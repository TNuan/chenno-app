import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccessDeniedModal = ({ 
  isOpen, 
  onClose, 
  title = "Quyền truy cập bị từ chối", 
  message = "Bạn không có quyền truy cập nội dung này.",
  buttonText = "Quay lại",
  redirectPath = "/",
  showBackdrop = true
}) => {
  const navigate = useNavigate();

  if (!isOpen) return null;
  
  const handleAction = () => {
    if (onClose) {
      onClose();
    }
    if (redirectPath) {
      navigate(redirectPath);
    }
  };

  return (
    <div className={`fixed inset-0 ${showBackdrop ? 'bg-black/50 backdrop-blur-sm' : ''} flex items-center justify-center z-50 p-4`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {title}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {message}
        </p>
        <div className="flex justify-end">
          <button
            onClick={handleAction}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedModal;