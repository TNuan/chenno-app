import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiCheckCircle, FiBell } from 'react-icons/fi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { markNotificationAsRead, markAllNotificationsAsRead } from '../../services/api';

const Notifications = ({ 
  isOpen, 
  onClose, 
  notifications, 
  isLoading,
  onUpdate 
}) => {
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      const updatedNotifications = notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, is_read: true }
          : notification
      );
      onUpdate(updatedNotifications);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      const updatedNotifications = notifications.map(notification => ({
        ...notification,
        is_read: true
      }));
      onUpdate(updatedNotifications);
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const displayedNotifications = showOnlyUnread
    ? notifications.filter(notification => !notification.is_read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!isOpen) return null;

  return (
    <div 
      ref={dropdownRef}
      onClick={handleContentClick}
      className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Thông báo
            </h3>
            {unreadCount > 0 && (
              <span className="px-2 py-1 text-xs font-medium text-white bg-blue-500 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between mt-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showOnlyUnread}
              onChange={(e) => setShowOnlyUnread(e.target.checked)}
              className="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-300 dark:border-gray-600"
            />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Chỉ hiện chưa đọc
            </span>
          </label>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[400px] overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Đang tải...
          </div>
        ) : displayedNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <FiBell className="mx-auto h-8 w-8 text-gray-400" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Không có thông báo nào
            </p>
          </div>
        ) : (
          displayedNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
            >
              {/* Avatar */}
              <div className="flex-shrink-0">
                {notification.avatar ? (
                  <img
                    src={notification.avatar}
                    alt=""
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-200 font-medium">
                      {notification.sender.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-medium">{notification.sender.username}</span>{': '}
                    {notification.content}
                  </p>
                  {!notification.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="ml-2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                      title="Đánh dấu đã đọc"
                    >
                      <FiCheckCircle className="h-5 w-5" />
                    </button>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {format(new Date(notification.created_at), 'HH:mm dd/MM/yyyy', { locale: vi })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;