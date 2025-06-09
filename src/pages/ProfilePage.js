import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCamera, FiSave, FiArrowLeft, FiUser, FiMail, FiPhone, FiEdit3 } from 'react-icons/fi';
import Avatar from 'react-avatar';
import { getUserProfile, updateUserProfile, uploadAvatar } from '../services/api';
import { toast } from 'react-toastify';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';

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
        <div className="flex flex-1 mx-auto w-full mt-16">
          {/* <Sidebar className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto" /> */}
          <main className="flex-1 ml-64 bg-gray-100 dark:bg-gray-800 min-h-[calc(100vh-4rem)]">
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 mx-auto w-full mt-16">
        {/* <Sidebar className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto" /> */}
        <main className="flex-1 ml-64 bg-gray-100 dark:bg-gray-800 min-h-[calc(100vh-4rem)]">
          <div className="max-w-4xl mx-auto p-6">
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

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Cover */}
              <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
              
              {/* Profile Info */}
              <div className="px-6 pb-6">
                {/* Avatar */}
                <div className="flex items-end justify-between -mt-16 mb-4">
                  <div className="relative">
                    <div className="relative">
                      {previewAvatar ? (
                        <img
                          src={previewAvatar}
                          alt="Preview"
                          className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 object-cover"
                        />
                      ) : profile?.avatar ? (
                        <img
                          src={`http://localhost:3000${profile.avatar}`}
                          alt="Avatar"
                          className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-900 object-cover"
                        />
                      ) : (
                        <Avatar
                          name={profile?.username || 'User'}
                          size="96"
                          round={true}
                          className="border-4 border-white dark:border-gray-900"
                        />
                      )}
                      
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                          <FiCamera size={16} />
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

                {/* Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Username */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiUser className="inline mr-2" size={16} />
                      Tên người dùng
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập tên người dùng"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                        {profile?.username || 'Chưa cập nhật'}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiMail className="inline mr-2" size={16} />
                      Email
                    </label>
                    <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                      {profile?.email}
                    </p>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Họ và tên
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập họ và tên"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                        {profile?.full_name || 'Chưa cập nhật'}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FiPhone className="inline mr-2" size={16} />
                      Số điện thoại
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Nhập số điện thoại"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg">
                        {profile?.phone || 'Chưa cập nhật'}
                      </p>
                    )}
                  </div>

                  {/* Bio */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tiểu sử
                    </label>
                    {isEditing ? (
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Viết vài dòng về bản thân..."
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg min-h-[100px]">
                        {profile?.bio || 'Chưa cập nhật'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Account Info */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                    Thông tin tài khoản
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Ngày tạo tài khoản:</span>
                      <p className="text-gray-900 dark:text-gray-100">
                        {new Date(profile?.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Cập nhật lần cuối:</span>
                      <p className="text-gray-900 dark:text-gray-100">
                        {profile?.updated_at 
                          ? new Date(profile.updated_at).toLocaleDateString('vi-VN')
                          : 'Chưa cập nhật'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;