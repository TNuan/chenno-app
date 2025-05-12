import React, { createContext, useContext, useState } from 'react';
import AlertModal from '../components/Modal/AlertModal';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    primaryAction: null,
    primaryActionText: 'OK',
    secondaryAction: null,
    secondaryActionText: 'Cancel',
  });

  const showAlert = (options) => {
    setAlertState({
      isOpen: true,
      ...options,
    });
  };

  const hideAlert = () => {
    setAlertState((prev) => ({
      ...prev,
      isOpen: false,
    }));
  };

  // Helper functions for common alert types
  const showError = (title, message, action) => {
    showAlert({
      title,
      message,
      type: 'error',
      primaryAction: action || hideAlert,
    });
  };

  const showSuccess = (title, message, action) => {
    showAlert({
      title,
      message,
      type: 'success',
      primaryAction: action || hideAlert,
    });
  };

  const showWarning = (title, message, primaryAction, secondaryAction) => {
    showAlert({
      title,
      message,
      type: 'warning',
      primaryAction: primaryAction || hideAlert,
      secondaryAction,
    });
  };

  const showInfo = (title, message, action) => {
    showAlert({
      title,
      message,
      type: 'info',
      primaryAction: action || hideAlert,
    });
  };

  // Sửa lại để nhận callback cho việc chuyển hướng
  const showAccessDenied = (message, onRedirect) => {
    showAlert({
      title: 'Quyền truy cập đã thay đổi',
      message: message || 'Bạn không có quyền truy cập nội dung này.',
      type: 'error',
      primaryAction: () => {
        hideAlert();
        // Gọi callback chuyển hướng nếu được cung cấp
        if (typeof onRedirect === 'function') {
          onRedirect();
        }
      },
      primaryActionText: 'Quay lại',
    });
  };

  return (
    <AlertContext.Provider
      value={{
        showAlert,
        hideAlert,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        showAccessDenied,
      }}
    >
      {children}
      <AlertModal
        {...alertState}
        onClose={hideAlert}
      />
    </AlertContext.Provider>
  );
};

export const useAlert = () => useContext(AlertContext);