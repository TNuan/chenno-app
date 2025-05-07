import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiSearch, FiUserPlus } from 'react-icons/fi';
import { searchUser, addMemberToWorkspace, bulkInviteToWorkspace } from '../../services/api';
import { toast } from 'react-toastify';

const InviteMemberModal = ({ isOpen, onClose, workspaceId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const response = await searchUser(searchQuery);
          setSearchResults(response.users.filter(user => 
            !selectedUsers.some(selected => selected.id === user.id)
          ));
          setShowResults(true);
        } catch (error) {
          console.error('Search failed:', error);
          toast.error('Failed to search users');
        }
      }, 300);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedUsers]);

  const handleUserSelect = (user) => {
    setSelectedUsers([...selectedUsers, user]);
    setSearchQuery('');
    setShowResults(false);
    searchInputRef.current?.focus();
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId));
  };

  const handleInvite = async () => {
    if (selectedUsers.length === 0) {
      toast.warning('Please select at least one user to invite');
      return;
    }

    setIsLoading(true);
    try {
      await bulkInviteToWorkspace(workspaceId, 
        {
          "userIds" : selectedUsers.map(user => user.id),
          "role" : "member"
        });
      setSelectedUsers([]);
      toast.success('Invitations sent successfully');
      onClose();
    } catch (error) {
      console.error('Invite failed:', error);
      toast.error('Failed to send invitations');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        {/* Changed max-w-md to max-w-2xl for wider modal */}
        <div className="inline-block w-full max-w-2xl p-6 my-32 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-900 rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Invite Members
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <FiX className="h-6 w-6" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search users by name or email..."
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div
                    key={user.id}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full"
                  >
                    <span className="text-sm">{user.email}</span>
                    <button
                      onClick={() => handleRemoveUser(user.id)}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          {showResults && searchResults.length > 0 && (
            <div className="mt-1 max-h-60 overflow-auto rounded-md bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
              {searchResults.map(user => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-3"
                >
                  <div className="flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt="" className="h-6 w-6 rounded-full" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-800 dark:text-blue-200">
                          {user.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Invite Button */}
          <div className="mt-6">
            <button
              onClick={handleInvite}
              disabled={isLoading || selectedUsers.length === 0}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiUserPlus className="mr-2 h-5 w-5" />
              {isLoading ? 'Sending Invites...' : 'Send Invitations'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteMemberModal;