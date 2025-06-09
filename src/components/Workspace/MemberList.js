import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiMoreHorizontal, FiLink, FiUserPlus, FiTrash2, FiUserCheck } from 'react-icons/fi';
import InviteMemberModal from './InviteMemberModal';
import UserAvatar from '../common/UserAvatar'; // Thêm import UserAvatar
import { getMembersByWorkspace, updateRoleMember, removeMemberFromWorkspace } from '../../services/api';
import { toast } from 'react-toastify';

const MemberActions = ({ member, workspaceId, onUpdate, currentUserRole }) => {
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
      await updateRoleMember(workspaceId, member.user_id, { role: newRole });
      onUpdate({ ...member, role: newRole });
      toast.success(`Cập nhật vai trò của ${member.username} thành ${newRole}`);
    } catch (error) {
      console.error('Failed to update member role:', error);
      toast.error('Không thể cập nhật vai trò thành viên');
    }
    setIsOpen(false);
  };

  const handleRemoveMember = async () => {
    if (window.confirm(`Bạn có chắc muốn xóa ${member.username} khỏi workspace này?`)) {
      try {
        await removeMemberFromWorkspace(workspaceId, member.user_id);
        onUpdate(null, true);
        toast.success(`Đã xóa ${member.username} khỏi workspace`);
      } catch (error) {
        console.error('Failed to remove member:', error);
        toast.error('Không thể xóa thành viên');
      }
    }
    setIsOpen(false);
  };

  // Don't show actions for workspace owner or if current user isn't admin/owner
  if (member.role === 'owner' || (currentUserRole !== 'owner' && currentUserRole !== 'admin')) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
      >
        <FiMoreHorizontal className="h-5 w-5 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 py-1 border border-gray-200 dark:border-gray-700">
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
            </>
          )}
          <button
            onClick={handleRemoveMember}
            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
          >
            <FiTrash2 className="mr-2 h-4 w-4" />
            Xóa khỏi workspace
          </button>
        </div>
      )}
    </div>
  );
};

const MemberList = ({ workspaceId, role }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await getMembersByWorkspace(workspaceId);
        setMembers(response.members);
      } catch (err) {
        console.error('Failed to fetch members:', err);
        toast.error('Không thể tải danh sách thành viên workspace');
        setError('Không thể tải danh sách thành viên');
      } finally {
        setIsLoading(false);
      }
    };

    if (workspaceId) {
      fetchMembers();
    }
  }, [workspaceId]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, index) => (
              <div key={`member-skeleton-${index}`} className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          {error}
        </div>
      </div>
    );
  }

  // Filter members based on search query
  const filteredMembers = members.filter(member =>
    member.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMemberUpdate = (updatedMember, isRemoved = false) => {
    if (isRemoved) {
      setMembers((prevMembers) => prevMembers.filter((m) => m.user_id !== updatedMember.user_id));
    } else {
      setMembers((prevMembers) =>
        prevMembers.map((m) => (m.user_id === updatedMember.user_id ? updatedMember : m))
      );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      <div className="">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Cộng tác viên
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {filteredMembers.length}/10
            </p>
          </div>
          {(role === 'owner' || role === 'admin') && (
            <button
              onClick={() => setIsInviteModalOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <FiUserPlus className="mr-2 h-5 w-5" />
              Mời thành viên
            </button>
          )}
        </div>

        {/* Search and Filter Section */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Tìm kiếm theo tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Members List */}
        <div className="space-y-4">
          {/* Workspace Members Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Thành viên workspace ({filteredMembers.length})
            </h3>
            <div className="space-y-2">
              {filteredMembers.map((member) => (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      {/* Thay thế phần avatar cũ bằng UserAvatar */}
                      <UserAvatar
                        user={{
                          username: member.username,
                          email: member.email,
                          avatar: member.avatar
                        }}
                        size="md"
                        showOnlineIndicator={false}
                        className="hover:scale-105 transition-transform"
                        ringColor="border-gray-200 dark:border-gray-600"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {member.username}
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
                        'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                      }`}>
                      {member.role === 'owner' ? 'Owner' : 
                       member.role === 'admin' ? 'Admin' : 'Member'}
                    </span>
                    <MemberActions
                      member={member}
                      workspaceId={workspaceId}
                      onUpdate={handleMemberUpdate}
                      currentUserRole={role}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Invite Link Section */}
          {(role === 'owner' || role === 'admin') && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FiLink className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Mời bằng liên kết
                  </span>
                </div>
                <button className="text-sm text-blue-500 hover:text-blue-600 font-medium">
                  Tạo liên kết
                </button>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Bất kỳ ai có liên kết mời có thể tham gia Workspace này. Bạn cũng có thể vô hiệu hóa và tạo liên kết mời mới cho Workspace này bất kỳ lúc nào.
              </p>
            </div>
          )}
        </div>
      </div>

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={workspaceId}
      />
    </div>
  );
};

export default MemberList;