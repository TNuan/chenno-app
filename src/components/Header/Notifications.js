import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiCheckCircle, FiBell } from 'react-icons/fi';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'react-toastify';
import { markNotificationAsRead, markAllNotificationsAsRead } from '../../services/api';
import { getSocket } from '../../services/socket';
import UserAvatar from '../common/UserAvatar'; // Thêm import UserAvatar

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
      toast.error('Không thể đánh dấu thông báo đã đọc');
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
      
      const socket = getSocket();
      if (socket) {
        socket.emit('notification_read_all');
      }
      
      toast.success('Đã đánh dấu tất cả thông báo là đã đọc');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Không thể đánh dấu tất cả thông báo đã đọc');
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.is_read) {
      handleMarkAsRead(notification.id);
    }
    
    if (notification.data && notification.data.redirectUrl) {
      onClose();
      window.location.href = notification.data.redirectUrl;
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
      className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
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
              className={`flex items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              {/* Avatar - Thay thế bằng UserAvatar */}
              <div className="flex-shrink-0">
                <UserAvatar
                  user={{
                    username: notification.sender?.username || "System",
                    email: notification.sender?.email,
                    avatar: notification.sender?.avatar
                  }}
                  size="lg"
                  showOnlineIndicator={false}
                  className="hover:scale-105 transition-transform"
                  ringColor="border-gray-200 dark:border-gray-600"
                />
              </div>

              {/* Content */}
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-medium truncate">
                        {notification.sender?.username || "Hệ thống"}
                      </span>
                      {': '}
                      <span className="text-gray-700 dark:text-gray-300">
                        {notification.content}
                      </span>
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(notification.created_at), 'HH:mm dd/MM/yyyy', { locale: vi })}
                    </p>
                    {notification.data?.description && (
                      <p className="mt-1 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                        {notification.data.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Read/Unread indicator and action */}
                  <div className="flex-shrink-0 ml-2">
                    {!notification.is_read ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                          title="Đánh dấu đã đọc"
                        >
                          <FiCheckCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-6 h-6"></div> // Placeholder để giữ alignment
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer nếu có nhiều thông báo */}
      {displayedNotifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="text-center">
            <button className="text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium">
              Xem tất cả thông báo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;