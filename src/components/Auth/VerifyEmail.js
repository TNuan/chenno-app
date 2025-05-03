import React from 'react';
import { useSearchParams, useNavigate, useEffect } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

const VerifyEmail = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900">
          <FiCheckCircle className="h-10 w-10 text-green-500 dark:text-green-400" />
        </div>

        {/* Success Message */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Xác thực email thành công!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Tài khoản của bạn đã được xác thực. Bạn có thể đăng nhập và bắt đầu sử dụng ứng dụng.
          </p>
        </div>

        {/* Back to Login Button */}
        <button
          onClick={() => navigate('/login')}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Quay lại đăng nhập
        </button>
      </div>
    </div>
  );
};

export default VerifyEmail;