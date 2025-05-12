import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiMoreHorizontal, FiUserCheck, FiTrash2, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { emitBoardChange } from '../../services/socket';

const MemberActions = ({ member, boardId, onUpdate, currentUserRole }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdateRole = async (newRole) => {
    try {
      await api.put(`/boards/${boardId}/members/${member.user_id}`, { role: newRole });
      onUpdate({ ...member, role: newRole });
      
      // Emit socket event for real-time updates
      emitBoardChange(boardId, 'update_member', {
        board_id: boardId,
        user_id: member.user_id,
        role: newRole
      });
      
      toast.success(`Đã cập nhật vai trò của ${member.username} thành ${newRole}`);
    } catch (error) {
      console.error('Failed to update member role:', error);
      toast.error('Không thể cập nhật vai trò thành viên');
    }
    setIsOpen(false);
  };

  const handleRemoveMember = async () => {
    if (window.confirm(`Bạn có chắc muốn xóa ${member.username} khỏi bảng này?`)) {
      try {
        await api.delete(`/boards/${boardId}/members/${member.user_id}`);
        onUpdate(member, true);
        
        // Emit socket event for real-time updates
        emitBoardChange(boardId, 'remove_member', {
          board_id: boardId,
          user_id: member.user_id
        });
        
        toast.success(`Đã xóa ${member.username} khỏi bảng`);
      } catch (error) {
        console.error('Failed to remove member:', error);
        toast.error('Không thể xóa thành viên');
      }
    }
    setIsOpen(false);
  };

  // Don't show actions if current user doesn't have necessary permissions
  // or if trying to modify owner or self
  if (member.role === 'owner' || 
      (currentUserRole !== 'owner' && currentUserRole !== 'admin') || 
      member.is_current_user) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
      >
        <FiMoreHorizontal className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute z-50 right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1 border border-gray-200 dark:border-gray-700">
          {currentUserRole === 'owner' && (
            <>
              <button
                onClick={() => handleUpdateRole('admin')}
                className={`w-full text-left px-4 py-2 text-sm ${
                  member.role === 'admin' 
                    ? 'text-blue-500 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300'
                } hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center`}
              >
                <FiUserCheck className="mr-2 h-4 w-4" />
                Làm Admin
              </button>
              <button
                onClick={() => handleUpdateRole('member')}
                className={`w-full text-left px-4 py-2 text-sm ${
                  member.role === 'member' 
                    ? 'text-blue-500 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300'
                } hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center`}
              >
                <FiUserCheck className="mr-2 h-4 w-4" />
                Làm Thành viên
              </button>
              <button
                onClick={() => handleUpdateRole('observer')}
                className={`w-full text-left px-4 py-2 text-sm ${
                  member.role === 'observer' 
                    ? 'text-blue-500 dark:text-blue-400' 
                    : 'text-gray-700 dark:text-gray-300'
                } hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center`}
              >
                <FiUserCheck className="mr-2 h-4 w-4" />
                Làm Observer
              </button>
            </>
          )}
          <button
            onClick={handleRemoveMember}
            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
          >
            <FiTrash2 className="mr-2 h-4 w-4" />
            Xóa khỏi bảng
          </button>
        </div>
      )}
    </div>
  );
};

const BoardMembersModal = ({ isOpen, onClose, boardId, boardMembers = [], currentUserRole }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const modalRef = useRef(null);

  // Load members from props or from API if needed
  useEffect(() => {
    if (isOpen) {
      setMembers(boardMembers);
      setIsLoading(false);
      
      // Fetch additional data if needed
      if (boardMembers.length === 0) {
        fetchBoardMembers();
      }
    } else {
      setSearchQuery('');
    }
  }, [isOpen, boardId, boardMembers]);

  const fetchBoardMembers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/boards/${boardId}/members`);
      setMembers(response.data.members || []);
    } catch (error) {
      console.error('Failed to fetch board members:', error);
      toast.error('Không thể tải danh sách thành viên');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
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

  const handleMemberUpdate = (updatedMember, isRemoved = false) => {
    if (isRemoved) {
      setMembers(prevMembers => prevMembers.filter(m => m.user_id !== updatedMember.user_id));
    } else {
      setMembers(prevMembers => 
        prevMembers.map(m => m.user_id === updatedMember.user_id ? updatedMember : m)
      );
    }
  };

  // Filter members based on search query
  const filteredMembers = members.filter(member => 
    member.username?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    member.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Thành viên của bảng
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Member List */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Search Box */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tìm kiếm thành viên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Members List */}
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredMembers.length > 0 ? (
            <div className="space-y-2">
              {filteredMembers.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {member.avatar ? (
                        <img
                          className="h-8 w-8 rounded-full"
                          src={member.avatar}
                          alt={member.username}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                            {member.username?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {member.username}
                        {member.is_current_user && ' (bạn)'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {member.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full 
                      ${member.role === 'owner' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300' : 
                        member.role === 'admin' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' : 
                        member.role === 'observer' ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300' :
                        'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      }`}>
                      {member.role === 'owner' ? 'Owner' : 
                       member.role === 'admin' ? 'Admin' :  
                       member.role === 'observer' ? 'Observer' : 'Member'}
                    </span>
                    <MemberActions
                      member={member}
                      boardId={boardId}
                      onUpdate={handleMemberUpdate}
                      currentUserRole={currentUserRole}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500 dark:text-gray-400">
              Không tìm thấy thành viên nào
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-650"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default BoardMembersModal;