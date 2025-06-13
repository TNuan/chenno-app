import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiEdit3, FiCheck, FiXCircle, FiInfo } from 'react-icons/fi';
import { updateBoard } from '../../services/api';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const AboutBoardDropdown = ({ isOpen, onClose, board, onUpdate, canEdit, anchorRef }) => {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState(board?.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (board?.description) {
      setDescription(board.description);
    }
  }, [board?.description]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          anchorRef.current && !anchorRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  // Position dropdown to match BoardMenu positioning
  const getDropdownPosition = () => {
    if (!anchorRef.current) return {};

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const dropdownHeight = 480; // Estimated height
    const dropdownWidth = 380;
    
    // Check available space
    const spaceBelow = window.innerHeight - anchorRect.bottom;
    const spaceAbove = anchorRect.top;
    const spaceLeft = anchorRect.left;

    let top, left;

    // Vertical positioning - same as BoardMenu (mt-2 = 8px below button)
    top = anchorRect.bottom + 8;

    // If dropdown would go below screen, position above
    if (top + dropdownHeight > window.innerHeight - 8) {
      top = anchorRect.top - dropdownHeight - 8;
    }

    // Horizontal positioning - show to the left of menu button
    if (spaceLeft >= dropdownWidth + 8) {
      // Enough space on the left
      left = anchorRect.left - dropdownWidth - 8;
    } else {
      // Not enough space on the left, show to the right but offset more
      left = anchorRect.right + 8;
    }

    // Ensure dropdown doesn't go off screen
    top = Math.max(8, Math.min(top, window.innerHeight - dropdownHeight - 8));
    left = Math.max(8, Math.min(left, window.innerWidth - dropdownWidth - 8));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 50
    };
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSaveDescription = async () => {
    if (description.trim() === (board.description || '')) {
      setIsEditingDescription(false);
      return;
    }

    setIsLoading(true);
    try {
      const updatedBoard = await updateBoard(board.id, { 
        description: description.trim() || null 
      });
      
      // Update board data in parent component
      onUpdate({
        ...board,
        description: description.trim() || null
      });
      
      setIsEditingDescription(false);
      toast.success('Đã cập nhật mô tả board');
    } catch (error) {
      console.error('Update board description failed:', error);
      toast.error('Không thể cập nhật mô tả board');
      setDescription(board.description || '');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setDescription(board.description || '');
    setIsEditingDescription(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (!isOpen || !board) return null;

  return (
    <div
      ref={dropdownRef}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-96"
      style={getDropdownPosition()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <FiInfo className="w-4 h-4 text-blue-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            About this board
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <FiX className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        
        {/* Board Name */}
        <div className="mb-4">
          <h4 className="text-base font-medium text-gray-900 dark:text-white mb-1">
            {board.name}
          </h4>
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 space-x-3">
            <span>
              Created: {format(new Date(board.created_at), 'MMM dd, yyyy')}
            </span>
            {board.updated_at && board.updated_at !== board.created_at && (
              <span>
                Updated: {format(new Date(board.updated_at), 'MMM dd, yyyy')}
              </span>
            )}
          </div>
        </div>

        {/* Description Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h5 className="text-sm font-medium text-gray-900 dark:text-white">
              Description
            </h5>
            {canEdit && !isEditingDescription && (
              <button
                onClick={() => setIsEditingDescription(true)}
                className="flex items-center px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                <FiEdit3 className="w-3 h-3 mr-1" />
                Edit
              </button>
            )}
          </div>

          {/* Description Display/Edit */}
          {isEditingDescription ? (
            <div className="space-y-2">
              <textarea
                value={description}
                onChange={handleDescriptionChange}
                onKeyDown={handleKeyPress}
                placeholder="Add a description for this board..."
                className="w-full px-2 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleSaveDescription}
                  disabled={isLoading}
                  className="flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiCheck className="w-3 h-3 mr-1" />
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="flex items-center px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                >
                  <FiXCircle className="w-3 h-3 mr-1" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="min-h-[40px]">
              {board.description ? (
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {board.description}
                </p>
              ) : (
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                  {canEdit ? (
                    <button
                      onClick={() => setIsEditingDescription(true)}
                      className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Click to add a description for this board...
                    </button>
                  ) : (
                    'No description provided.'
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Board Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {board.members?.length || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Members
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600 dark:text-green-400">
              {board.columns?.length || 0}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Lists
            </div>
          </div>
        </div>

        {/* Visibility Info */}
        <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="flex items-center mb-1">
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              Visibility:
            </span>
            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
              {board.visibility === 0 ? 'Private' : 'Public'}
            </span>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {board.visibility === 0 
              ? 'Only board members can see and edit this board.'
              : 'Anyone can see this board. Only board members can edit.'
            }
          </p>
        </div>

      </div>
    </div>
  );
};

export default AboutBoardDropdown;