import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiArchive, FiRotateCcw, FiTrash2, FiClock, FiUser } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { getArchivedCards } from '../../services/api';
import api from '../../services/api';

const ArchivedItemsDropdown = ({ isOpen, onClose, board, anchorRef }) => {
  const [archivedCards, setArchivedCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

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

  // Fetch archived cards when dropdown opens
  useEffect(() => {
    if (isOpen && board?.id) {
      fetchArchivedCards();
    }
  }, [isOpen, board?.id]);

  // Position dropdown to match BoardMenu positioning
  const getDropdownPosition = () => {
    if (!anchorRef.current) return {};

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const dropdownHeight = 500; // Estimated height
    const dropdownWidth = 420;
    
    let top, left;

    // Vertical positioning - same as BoardMenu (mt-2 = 8px below button)
    top = anchorRect.bottom + 8;

    // If dropdown would go below screen, position above
    if (top + dropdownHeight > window.innerHeight - 8) {
      top = anchorRect.top - dropdownHeight - 8;
    }

    // Horizontal positioning - show to the right of menu button (same as BoardMenu)
    left = anchorRect.right - dropdownWidth;

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

  const fetchArchivedCards = async () => {
    setIsLoading(true);
    try {
      const response = await getArchivedCards(board.id, {
        search: searchTerm,
        limit: 50,
        offset: 0
      });
      setArchivedCards(response.data.data.cards || []);
    } catch (error) {
      console.error('Failed to fetch archived cards:', error);
      toast.error('Không thể tải danh sách items đã archive');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnarchiveCard = async (cardId) => {
    try {
      await api.patch(`/cards/${cardId}/unarchive`);
      
      // Remove from archived list
      setArchivedCards(prev => prev.filter(card => card.id !== cardId));
      
      toast.success('Đã khôi phục card thành công');
    } catch (error) {
      console.error('Failed to unarchive card:', error);
      toast.error('Không thể khôi phục card');
    }
  };

  const handleDeleteCard = async (cardId, cardTitle) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn card "${cardTitle}"? Hành động này không thể hoàn tác.`)) {
      return;
    }

    try {
      await api.delete(`/cards/${cardId}`);
      
      // Remove from archived list
      setArchivedCards(prev => prev.filter(card => card.id !== cardId));
      
      toast.success('Đã xóa card vĩnh viễn');
    } catch (error) {
      console.error('Failed to delete card:', error);
      toast.error('Không thể xóa card');
    }
  };

  // Search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isOpen) {
        fetchArchivedCards();
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, isOpen]);

  // Filter cards based on search term
  const filteredCards = archivedCards.filter(card =>
    card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    card.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-[420px]"
      style={getDropdownPosition()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <FiArchive className="w-4 h-4 text-orange-500 mr-2" />
          <h3 className="text-sm font-medium text-gray-900 dark:text-white">
            Archived Items
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <FiX className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search archived cards..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-500"></div>
          </div>
        ) : filteredCards.length > 0 ? (
          <div className="p-2 space-y-2">
            {filteredCards.map(card => (
              <ArchivedCardItem
                key={card.id}
                card={card}
                onUnarchive={() => handleUnarchiveCard(card.id)}
                onDelete={() => handleDeleteCard(card.id, card.title)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            {searchTerm ? (
              <div>
                <FiArchive className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No archived cards match your search</p>
              </div>
            ) : (
              <div>
                <FiArchive className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No archived cards in this board</p>
                <p className="text-xs mt-1 opacity-75">Cards you archive will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredCards.length > 0 && (
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {filteredCards.length} archived card{filteredCards.length !== 1 ? 's' : ''} found
          </p>
        </div>
      )}
    </div>
  );
};

// Component for individual archived card item
const ArchivedCardItem = ({ card, onUnarchive, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 overflow-hidden">
      {/* Card Header */}
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1 truncate">
              {card.title}
            </h4>
            
            {/* Card Meta Info */}
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
              {card.column_name && (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-1"></span>
                  {card.column_name}
                </span>
              )}
              
              {card.archived_at && (
                <span className="flex items-center">
                  <FiClock className="w-3 h-3 mr-1" />
                  Archived {format(new Date(card.archived_at), 'MMM d, yyyy')}
                </span>
              )}
              
              {card.archived_by_username && (
                <span className="flex items-center">
                  <FiUser className="w-3 h-3 mr-1" />
                  by {card.archived_by_username}
                </span>
              )}
            </div>

            {/* Labels */}
            {card.labels && card.labels.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {card.labels.slice(0, 3).map(label => (
                  <span
                    key={label.id}
                    className="inline-block px-2 py-0.5 text-xs rounded-full text-white"
                    style={{ backgroundColor: label.color }}
                  >
                    {label.name}
                  </span>
                ))}
                {card.labels.length > 3 && (
                  <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                    +{card.labels.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Description Preview */}
            {card.description && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                  {isExpanded ? card.description : card.description.substring(0, 100) + (card.description.length > 100 ? '...' : '')}
                </p>
                {card.description.length > 100 && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
                  >
                    {isExpanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}

            {/* Card Stats */}
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
              {card.attachment_count > 0 && (
                <span className="flex items-center">
                  📎 {card.attachment_count}
                </span>
              )}
              {card.comment_count > 0 && (
                <span className="flex items-center">
                  💬 {card.comment_count}
                </span>
              )}
              {card.due_date && (
                <span className="flex items-center">
                  📅 {format(new Date(card.due_date), 'MMM d')}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={onUnarchive}
              className="p-1.5 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
              title="Restore card"
            >
              <FiRotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              title="Delete permanently"
            >
              <FiTrash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchivedItemsDropdown;