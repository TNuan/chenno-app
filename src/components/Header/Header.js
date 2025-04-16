import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiInfo, FiLogOut, FiUser, FiSettings } from 'react-icons/fi';
import Avatar from 'react-avatar';

const Header = () => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center">
          <div
            className="text-2xl font-bold text-blue-600 cursor-pointer"
            onClick={() => navigate('/dashboard')}
          >
            Chenno
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 mx-4 max-w-lg">
          <input
            type="text"
            placeholder="Tìm kiếm workspace, board, card..."
            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-600 hover:text-blue-600 relative">
            <FiBell size={24} />
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
              3
            </span>
          </button>

          {/* Information */}
          <button className="p-2 text-gray-600 hover:text-blue-600">
            <FiInfo size={24} />
          </button>

          {/* Account */}
          <div className="relative">
            <button
              onClick={() => setIsAccountOpen(!isAccountOpen)}
              className="flex items-center space-x-2"
            >
              <Avatar name="User Name" size="40" round={true} />
            </button>
            {isAccountOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <FiUser className="mr-2" />
                  Hồ sơ
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <FiSettings className="mr-2" />
                  Cài đặt
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <FiLogOut className="mr-2" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;