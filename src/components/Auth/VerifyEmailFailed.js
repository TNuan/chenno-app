import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiXCircle } from 'react-icons/fi';

const VerifyEmailFailed = (props) => {
  const { message } = props
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg text-center">
        {/* Error Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900">
          <FiXCircle className="h-10 w-10 text-red-500 dark:text-red-400" />
        </div>

        {/* Error Message */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Xác thực email thất bại!
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {message}
            {/* Đã có lỗi xảy ra trong quá trình xác thực email của bạn. Vui lòng thử lại hoặc liên hệ hỗ trợ. */}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Thử lại
          </button>
          <button
            onClick={() => navigate('/login')}
            className="w-full flex justify-center py-3 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            Quay lại đăng nhập
          </button>
        </div>

        {/* Support Link */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Cần giúp đỡ?{' '}
          <a href="/support" className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400">
            Liên hệ hỗ trợ
          </a>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmailFailed;