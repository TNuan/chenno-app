import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiBell, FiInfo, FiLogOut, FiUser, FiSettings, FiMoon, FiSun, FiSearch } from 'react-icons/fi';
import Avatar from 'react-avatar';
import { ThemeContext } from '../../context/ThemeContext';
import { logout, getNotifications } from '../../services/api';
import Notifications from './Notifications';

const Header = () => {
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(true);

  const handleLogout = () => {
    logout().then(data => {
      if (data.status === true) {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        navigate('/login');
      } else {
        console.error(data.message);
      }
    })
  };

  useEffect(() => {
    if (!localStorage.getItem('user')) {
      navigate('/login')
    } else {
      const data = JSON.parse(localStorage.getItem('user'))
      setCurrentUser(data)
      setIsLoaded(true)
    }
  }, [])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoadingNotifications(true);
        const response = await getNotifications();
        setNotifications(response.notifications);
        setUnreadCount(response.notifications.filter(n => !n.is_read).length);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  const handleNotificationUpdate = (updatedNotifications) => {
    setNotifications(updatedNotifications);
    setUnreadCount(updatedNotifications.filter(n => !n.is_read).length);
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-8">
            <div
              onClick={() => navigate('/h')}
              className="flex items-center cursor-pointer group"
            >
              <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-2 rounded-lg mr-2 group-hover:scale-105 transition-transform">
                <span className="text-xl font-bold text-white">IT</span>
              </div>
              <span className="text-xl font-bold text-gray-800 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                Kv1
              </span>
            </div>
          </div>

          {/* Search Section */}
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Tìm kiếm workspace, board..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
            >
              {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>

            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsNotificationsOpen(!isNotificationsOpen);
                }}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
                title="Thông báo"
              >
                <FiBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-xs text-white justify-center items-center">
                      {unreadCount}
                    </span>
                  </span>
                )}
              </button>
              
              {isNotificationsOpen && (
                <Notifications 
                  isOpen={isNotificationsOpen} 
                  onClose={() => setIsNotificationsOpen(false)} 
                  notifications={notifications}
                  isLoading={isLoadingNotifications}
                  onUpdate={handleNotificationUpdate}
                />
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="flex items-center space-x-3 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all"
              >
                <Avatar
                  name="User Name"
                  size="32"
                  round={true}
                  className="border-2 border-blue-500"
                />
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">
                  {currentUser?.username || 'Người dùng'}
                </span>
              </button>

              {isAccountOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 animate-fadeIn">
                  {/* Profile Section */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{currentUser?.username || "Người dùng"}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{currentUser?.email || "example@gmail.com"}</p>
                  </div>

                  {/* Menu Items */}
                  <div className="py-1">
                    <button
                      onClick={() => navigate('/profile')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiUser className="mr-3" size={16} />
                      Hồ sơ
                    </button>
                    <button
                      onClick={() => navigate('/settings')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <FiSettings className="mr-3" size={16} />
                      Cài đặt
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <FiLogOut className="mr-3" size={16} />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;