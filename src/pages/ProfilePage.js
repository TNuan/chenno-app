import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCamera, FiSave, FiArrowLeft, FiUser, FiMail, FiPhone, FiEdit3 } from 'react-icons/fi';
import ProfileAvatar from '../components/common/ProfileAvatar';
import { getUserProfile, updateUserProfile, uploadAvatar } from '../services/api';
import { toast } from 'react-toastify';
import Header from '../components/Header/Header';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    bio: '',
    phone: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewAvatar, setPreviewAvatar] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await getUserProfile();
      if (response.status) {
        setProfile(response.profile);
        setFormData({
          username: response.profile.username || '',
          full_name: response.profile.full_name || '',
          bio: response.profile.bio || '',
          phone: response.profile.phone || ''
        });
      }
    } catch (error) {
      toast.error('Không thể tải thông tin hồ sơ');
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước file không được vượt quá 5MB');
        return;
      }

      setAvatarFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewAvatar(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);

      // Upload avatar nếu có
      if (avatarFile) {
        const avatarResponse = await uploadAvatar(avatarFile);
        if (avatarResponse.status) {
          setProfile(prev => ({ ...prev, avatar: avatarResponse.profile.avatar }));
        }
      }

      // Cập nhật thông tin profile
      const response = await updateUserProfile(formData);
      if (response.status) {
        setProfile(response.profile);
        setIsEditing(false);
        setAvatarFile(null);
        setPreviewAvatar(null);
        
        // Cập nhật localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({
          ...currentUser,
          username: response.profile.username
        }));
        
        toast.success('Cập nhật hồ sơ thành công!');
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi cập nhật hồ sơ');
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: profile?.username || '',
      full_name: profile?.full_name || '',
      bio: profile?.bio || '',
      phone: profile?.phone || ''
    });
    setAvatarFile(null);
    setPreviewAvatar(null);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 mt-16 bg-gray-100 dark:bg-gray-800 min-h-[calc(100vh-4rem)]">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 mt-16 bg-gray-100 dark:bg-gray-800 min-h-[calc(100vh-4rem)]">
      {/* Thay đổi từ max-w-4xl thành max-w-7xl để match với header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/h')}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FiArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Hồ sơ cá nhân
            </h1>
          </div>
          
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  <FiSave size={16} />
                  <span>{isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <FiEdit3 size={16} />
                <span>Chỉnh sửa</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Card - Tăng độ rộng */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Cover - Tăng chiều cao */}
          <div className="h-40 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          
          {/* Profile Info */}
          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="flex items-end justify-between -mt-20 mb-6">
              <div className="relative">
                <div className="relative">
                  <ProfileAvatar
                    user={{
                      username: profile?.username,
                      email: profile?.email,
                      avatar: profile?.avatar
                    }}
                    previewSrc={previewAvatar}
                    size="w-32 h-32" // Tăng size avatar
                    borderColor="border-white dark:border-gray-900"
                  />
                  
                  {isEditing && (
                    <label className="absolute bottom-0 right-0 p-3 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                      <FiCamera size={18} />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Form - Tăng spacing */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <FiUser className="inline mr-2" size={16} />
                  Tên người dùng
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tên người dùng"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg">
                    {profile?.username || 'Chưa cập nhật'}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <FiMail className="inline mr-2" size={16} />
                  Email
                </label>
                <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg">
                  {profile?.email}
                </p>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <FiPhone className="inline mr-2" size={16} />
                  Số điện thoại
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập số điện thoại"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg">
                    {profile?.phone || 'Chưa cập nhật'}
                  </p>
                )}
              </div>

              {/* Full Name - Span 2 columns */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Họ và tên
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập họ và tên"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg">
                    {profile?.full_name || 'Chưa cập nhật'}
                  </p>
                )}
              </div>

              {/* Bio - Span all columns */}
              <div className="lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Tiểu sử
                </label>
                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Viết vài dòng về bản thân..."
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-4 py-3 rounded-lg min-h-[120px]">
                    {profile?.bio || 'Chưa cập nhật'}
                  </p>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-6">
                Thông tin tài khoản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Ngày tạo tài khoản:</span>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {new Date(profile?.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Cập nhật lần cuối:</span>
                  <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {profile?.updated_at 
                      ? new Date(profile.updated_at).toLocaleDateString('vi-VN')
                      : 'Chưa cập nhật'
                    }
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Trạng thái:</span>
                  <p className="text-lg font-medium text-green-600 dark:text-green-400">
                    Hoạt động
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Vai trò:</span>
                  <p className="text-lg font-medium text-blue-600 dark:text-blue-400">
                    Thành viên
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
  )
};

export default ProfilePage;