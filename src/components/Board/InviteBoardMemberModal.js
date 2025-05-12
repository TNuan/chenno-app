import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSearch, FiUserPlus, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { searchUser, addMemberToBoard } from '../../services/api';
import { toast } from 'react-toastify';
import { emitBoardChange } from '../../services/socket';

const roleOptions = [
  { value: 'member', label: 'Member', description: 'Thành viên có thể xem, thêm, sửa thẻ' },
  { value: 'admin', label: 'Admin', description: 'Quản trị viên có thể thực hiện tất cả thao tác trên bảng' },
  { value: 'observer', label: 'Observer', description: 'Chỉ được quyền xem, không thể chỉnh sửa' }
];

const InviteBoardMemberModal = ({ isOpen, onClose, boardId, existingMembers = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState('member');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessages, setSuccessMessages] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);

  const searchInputRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    // Focus search input when modal opens
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    // Handle click outside to close modal
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    // Reset states when modal closes
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUsers([]);
      setSelectedRole('member');
      setSuccessMessages([]);
      setErrorMessages([]);
    }
  }, [isOpen]);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  const handleSearch = async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const data = await searchUser(query);
      
      // Filter out users who are already members
      const existingMemberIds = existingMembers.map(member => member.user_id);
      const filteredResults = data.users.filter(user => !existingMemberIds.includes(user.id));
      
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Không thể tìm kiếm người dùng');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = (user) => {
    if (!selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user]);
      setSearchQuery('');
      setSearchResults([]);
      searchInputRef.current?.focus();
    }
  };

  const handleRemoveSelectedUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleSubmit = async () => {
    if (selectedUsers.length === 0) {
      toast.warning('Vui lòng chọn ít nhất một người dùng');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessages([]);
    setErrorMessages([]);

    // Invite each user individually
    const promises = selectedUsers.map(async user => {
      try {
        const result = await addMemberToBoard(boardId, { 
          user_id: user.id,
          role: selectedRole 
        });

        // Emit socket event for real-time updates
        emitBoardChange(boardId, 'add_member', {
          board_id: boardId,
          user_id: user.id,
          role: selectedRole,
          username: user.username
        });

        return { user, success: true };
      } catch (error) {
        console.error(`Error adding ${user.username} to board:`, error);
        return { 
          user, 
          success: false, 
          error: error.response?.data?.message || 'Lỗi không xác định'
        };
      }
    });

    const results = await Promise.all(promises);
    
    const successes = results.filter(r => r.success);
    const errors = results.filter(r => !r.success);
    
    setSuccessMessages(successes.map(r => `${r.user.username} đã được thêm vào board`));
    setErrorMessages(errors.map(r => `Không thể thêm ${r.user.username}: ${r.error}`));
    
    if (successes.length > 0) {
      toast.success(`Đã thêm ${successes.length} thành viên vào board`);
    }

    if (errors.length === 0) {
      // If all successful, clear selected users
      setSelectedUsers([]);
    } else {
      // If there were errors, keep only the failed users
      setSelectedUsers(errors.map(r => r.user));
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    // Only confirm if there are selected users and no submission in progress
    if (selectedUsers.length > 0 && !isSubmitting) {
      if (window.confirm('Bạn có muốn đóng? Các thay đổi chưa lưu sẽ bị mất.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Thêm thành viên vào bảng
          </h2>
          <button 
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Results */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Người dùng đã chọn:
              </h3>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div 
                    key={user.id}
                    className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full px-3 py-1 text-sm flex items-center"
                  >
                    <span className="mr-1">{user.username}</span>
                    <button 
                      onClick={() => handleRemoveSelectedUser(user.id)}
                      className="text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Box */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tìm kiếm người dùng theo tên hoặc email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {/* Search Results */}
          {isSearching ? (
            <div className="text-center py-4">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent mx-auto"></div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Đang tìm kiếm...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[200px] overflow-y-auto">
                {searchResults.map(user => (
                  <li 
                    key={user.id}
                    className="p-3 hover:bg-gray-50 dark:hover:bg-gray-750 cursor-pointer flex items-center"
                    onClick={() => handleSelectUser(user)}
                  >
                    <div className="flex-shrink-0 mr-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="h-8 w-8 rounded-full" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <button className="text-blue-500 hover:text-blue-600 p-1">
                      <FiUserPlus className="w-5 h-5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : searchQuery.trim() !== '' && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              Không tìm thấy người dùng phù hợp
            </div>
          )}

          {/* Role Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn vai trò:
            </label>
            <select
              value={selectedRole}
              onChange={handleRoleChange}
              className="block w-full border border-gray-300 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isSubmitting}
            >
              {roleOptions.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {roleOptions.find(r => r.value === selectedRole)?.description}
            </p>
          </div>

          {/* Status Messages */}
          {successMessages.length > 0 && (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="text-sm font-medium text-green-800 dark:text-green-400 flex items-center mb-2">
                <FiCheckCircle className="mr-1" /> Thành công:
              </h4>
              <ul className="list-disc pl-5 text-sm text-green-700 dark:text-green-300">
                {successMessages.map((message, idx) => (
                  <li key={idx}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          {errorMessages.length > 0 && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-400 flex items-center mb-2">
                <FiAlertCircle className="mr-1" /> Lỗi:
              </h4>
              <ul className="list-disc pl-5 text-sm text-red-700 dark:text-red-300">
                {errorMessages.map((message, idx) => (
                  <li key={idx}>{message}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-850 flex justify-end">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-650 mr-2"
          >
            Đóng
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedUsers.length === 0 || isSubmitting}
            className={`px-4 py-2 text-white rounded-lg shadow-sm ${
              selectedUsers.length === 0 || isSubmitting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                Đang xử lý...
              </div>
            ) : 'Mời thành viên'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteBoardMemberModal;