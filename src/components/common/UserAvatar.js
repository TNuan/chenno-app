import React, { useState } from 'react';

const UserAvatar = ({ 
  user, 
  size = 'sm', 
  showOnlineIndicator = false, 
  className = '',
  ringColor = 'border-white dark:border-gray-800'
}) => {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    xs: 'h-6 w-6',
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12'
  };
  
  const textSizeClasses = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  };
  
  const onlineIndicatorSizes = {
    xs: 'w-1.5 h-1.5 -bottom-0 -right-0',
    sm: 'w-2 h-2 -bottom-0.5 -right-0.5',
    md: 'w-2.5 h-2.5 -bottom-0.5 -right-0.5',
    lg: 'w-3 h-3 -bottom-1 -right-1',
    xl: 'w-3.5 h-3.5 -bottom-1 -right-1'
  };

  const displayName = user?.name || user?.username || user?.email || 'U';
  const avatarUrl = user?.avatar ? 
    (user.avatar.startsWith('http') ? user.avatar : `http://localhost:3000${user.avatar}`) 
    : null;

  return (
    <div 
      className={`relative inline-block ${className}`}
      title={displayName}
    >
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 ${ringColor}`}>
        {avatarUrl && !imageError ? (
          <img 
            src={avatarUrl}
            alt={displayName}
            className="h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={`h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white ${textSizeClasses[size]} font-semibold`}>
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      {showOnlineIndicator && (
        <div className={`absolute ${onlineIndicatorSizes[size]} bg-green-400 rounded-full border-2 border-white dark:border-gray-800 z-10`}></div>
      )}
    </div>
  );
};

export default UserAvatar;