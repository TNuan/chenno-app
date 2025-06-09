import React, { useState } from 'react';

const ProfileAvatar = ({ 
  user, 
  size = 'w-24 h-24',
  borderColor = 'border-white dark:border-gray-900',
  previewSrc = null,
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  
  const displayName = user?.name || user?.username || user?.email || 'U';
  const avatarUrl = user?.avatar ? 
    (user.avatar.startsWith('http') ? user.avatar : `http://localhost:3000${user.avatar}`) 
    : null;

  // Xác định text size dựa trên kích thước avatar
  const getTextSize = (sizeClass) => {
    if (sizeClass.includes('w-32') || sizeClass.includes('h-32')) return 'text-4xl';
    if (sizeClass.includes('w-24') || sizeClass.includes('h-24')) return 'text-2xl';
    return 'text-xl';
  };

  const textSize = getTextSize(size);

  // Nếu có preview, hiển thị preview
  if (previewSrc) {
    return (
      <div className={`${size} rounded-full border-4 ${borderColor} overflow-hidden ${className}`}>
        <img
          src={previewSrc}
          alt="Preview"
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className={`${size} rounded-full border-4 ${borderColor} overflow-hidden ${className}`}>
      {avatarUrl && !imageError ? (
        <img 
          src={avatarUrl}
          alt={displayName}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white ${textSize} font-semibold`}>
          {displayName.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;