import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSearch, FiUserPlus, FiCheckCircle, FiAlertCircle, FiUsers } from 'react-icons/fi';
import { searchUser, addMemberToBoard } from '../../services/api';
import { toast } from 'react-toastify';
import { emitBoardChange } from '../../services/socket';
import UserAvatar from '../common/UserAvatar';

const roleOptions = [
  { value: 'member', label: 'Member', description: 'Can view, add, and edit cards', color: 'green' },
  { value: 'admin', label: 'Admin', description: 'Can perform all actions on the board', color: 'blue' },
  { value: 'observer', label: 'Observer', description: 'Can only view, cannot edit', color: 'gray' }
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
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
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
    if (!isOpen) {
      setSearchQuery('');
      setSearchResults([]);
      setSelectedUsers([]);
      setSelectedRole('member');
      setSuccessMessages([]);
      setErrorMessages([]);
    }
  }, [isOpen]);

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
      const existingMemberIds = existingMembers.map(member => member.user_id);
      const filteredResults = data.users.filter(user => !existingMemberIds.includes(user.id));
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Unable to search users');
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
      toast.warning('Please select at least one user');
      return;
    }

    setIsSubmitting(true);
    setSuccessMessages([]);
    setErrorMessages([]);

    const promises = selectedUsers.map(async user => {
      try {
        const result = await addMemberToBoard(boardId, { 
          user_id: user.id,
          role: selectedRole 
        });

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
          error: error.response?.data?.message || 'Unknown error'
        };
      }
    });

    const results = await Promise.all(promises);
    
    const successes = results.filter(r => r.success);
    const errors = results.filter(r => !r.success);
    
    setSuccessMessages(successes.map(r => `${r.user.username} has been added to the board`));
    setErrorMessages(errors.map(r => `Unable to add ${r.user.username}: ${r.error}`));
    
    if (successes.length > 0) {
      toast.success(`Added ${successes.length} member(s) to the board`);
    }

    if (errors.length === 0) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(errors.map(r => r.user));
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    if (selectedUsers.length > 0 && !isSubmitting) {
      if (window.confirm('Do you want to close? Unsaved changes will be lost.')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentRole = roleOptions.find(r => r.value === selectedRole);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700"
      >
        {/* Compact Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-800 px-4 py-3">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <FiUsers className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Invite Members
              </h2>
              <p className="text-blue-100 text-sm mt-0.5">
                Add members to collaborate
              </p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="absolute top-2 right-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
            {/* Selected Users - Only show if any */}
            {selectedUsers.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center mb-2">
                  <FiCheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Selected ({selectedUsers.length})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <div 
                      key={user.id}
                      className="bg-white dark:bg-gray-800 rounded-md px-2 py-1.5 flex items-center space-x-2 shadow-sm border border-blue-200 dark:border-blue-700"
                    >
                      <UserAvatar
                        user={user}
                        size="xs"
                        showOnlineIndicator={false}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-24">
                        {user.username}
                      </span>
                      <button 
                        onClick={() => handleRemoveSelectedUser(user.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search Box */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Search Members
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isSubmitting}
                />
                {isSearching && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Search Results
                </h4>
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <div className="max-h-36 overflow-y-auto">
                    {searchResults.map(user => (
                      <div 
                        key={user.id}
                        className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer flex items-center justify-between transition-colors border-b border-gray-100 dark:border-gray-800 last:border-b-0"
                        onClick={() => handleSelectUser(user)}
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <UserAvatar
                            user={user}
                            size="sm"
                            showOnlineIndicator={false}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {user.username}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                        <button className="text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-2 rounded-md transition-all">
                          <FiUserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* No Results */}
            {searchQuery.trim() !== '' && !isSearching && searchResults.length === 0 && (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FiSearch className="w-5 h-5 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No matching users found
                </p>
              </div>
            )}

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Member Role
              </label>
              <select
                value={selectedRole}
                onChange={handleRoleChange}
                className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                disabled={isSubmitting}
              >
                {roleOptions.map(role => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {currentRole && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-2.5 border border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 bg-${currentRole.color}-500`}></span>
                    {currentRole.description}
                  </p>
                </div>
              )}
            </div>

            {/* Status Messages */}
            {successMessages.length > 0 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                <h4 className="text-sm font-medium text-green-800 dark:text-green-300 flex items-center mb-2">
                  <FiCheckCircle className="mr-2 w-4 h-4" /> Success
                </h4>
                <ul className="space-y-1 text-sm text-green-700 dark:text-green-400">
                  {successMessages.map((message, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="w-1 h-1 bg-green-500 rounded-full mr-2"></span>
                      <span className="truncate">{message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {errorMessages.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <h4 className="text-sm font-medium text-red-800 dark:text-red-300 flex items-center mb-2">
                  <FiAlertCircle className="mr-2 w-4 h-4" /> Errors
                </h4>
                <ul className="space-y-1 text-sm text-red-700 dark:text-red-400">
                  {errorMessages.map((message, idx) => (
                    <li key={idx} className="flex items-center">
                      <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                      <span className="truncate">{message}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {selectedUsers.length > 0 && (
                <span>Will invite {selectedUsers.length} member(s) as {currentRole?.label}</span>
              )}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedUsers.length === 0 || isSubmitting}
                className={`px-5 py-2 text-sm text-white rounded-lg transition-all ${
                  selectedUsers.length === 0 || isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                    Inviting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <FiUserPlus className="w-4 h-4 mr-2" />
                    Invite
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteBoardMemberModal;