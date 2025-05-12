import React from 'react';
import { FiAlertCircle, FiCheck, FiInfo, FiX } from 'react-icons/fi';

const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'error', // 'error', 'success', 'warning', 'info'
  primaryAction,
  primaryActionText = 'OK',
  secondaryAction,
  secondaryActionText = 'Cancel',
  showCloseButton = true,
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: <FiCheck className="w-6 h-6 text-green-500" />,
          primaryButtonClass: 'bg-green-600 hover:bg-green-700',
          titleClass: 'text-green-800 dark:text-green-400',
        };
      case 'warning':
        return {
          icon: <FiAlertCircle className="w-6 h-6 text-yellow-500" />,
          primaryButtonClass: 'bg-yellow-600 hover:bg-yellow-700',
          titleClass: 'text-yellow-800 dark:text-yellow-400',
        };
      case 'info':
        return {
          icon: <FiInfo className="w-6 h-6 text-blue-500" />,
          primaryButtonClass: 'bg-blue-600 hover:bg-blue-700',
          titleClass: 'text-blue-800 dark:text-blue-400',
        };
      case 'error':
      default:
        return {
          icon: <FiAlertCircle className="w-6 h-6 text-red-500" />,
          primaryButtonClass: 'bg-red-600 hover:bg-red-700',
          titleClass: 'text-red-800 dark:text-red-400',
        };
    }
  };

  const { icon, primaryButtonClass, titleClass } = getTypeStyles();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
        {showCloseButton && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-start mb-4">
          <div className="flex-shrink-0 mr-3">
            {icon}
          </div>
          <div>
            {title && (
              <h2 className={`text-xl font-semibold mb-2 ${titleClass}`}>
                {title}
              </h2>
            )}
            {message && (
              <p className="text-gray-700 dark:text-gray-300">
                {message}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          {secondaryAction && (
            <button
              onClick={secondaryAction}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              {secondaryActionText}
            </button>
          )}
          <button
            onClick={primaryAction || onClose}
            className={`px-4 py-2 text-white rounded transition-colors ${primaryButtonClass}`}
          >
            {primaryActionText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;