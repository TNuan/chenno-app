import React, { useState, useRef, useEffect } from 'react';
import { FiMoreHorizontal, FiMove, FiCopy, FiEye, FiArchive } from 'react-icons/fi';
import api from '../../services/api';
import { emitBoardChange } from '../../services/socket';
import { useAlert } from '../../contexts/AlertContext';

const CardActions = ({ 
  cardData, 
  onClose, 
  onUpdate, 
  hasCover = false, 
  canModify = false 
}) => {
  const [showActionDropdown, setShowActionDropdown] = useState(false);

  const [isWatching, setIsWatching] = useState(false);
  const { showConfirm } = useAlert();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);


  // Xử lý các hành động
  const handleMoveCard = () => {
    console.log("Move card action triggered");
    setShowActionDropdown(false);
    // Implement logic for moving card
  };

  const handleCopyCard = () => {
    console.log("Copy card action triggered");
    setShowActionDropdown(false);
    // Implement logic for copying card
  };

  const handleToggleWatch = () => {
    setIsWatching(!isWatching);
    console.log(`${isWatching ? 'Unwatch' : 'Watch'} card action triggered`);
    setShowActionDropdown(false);
    // Implement logic for watching/unwatching card
  };

  const handleArchiveCard = () => {
    console.log("Archive card action triggered");
    setShowActionDropdown(false);
    
    setIsConfirmOpen(true);
    showConfirm(
      'Lưu trữ thẻ',
      'Bạn có chắc chắn muốn lưu trữ thẻ này? Bạn có thể khôi phục nó sau từ kho lưu trữ.',
      async () => {
        setLoading(true);
        try {
          const updatedCard = {
            ...cardData,
            is_archived: true
          };
          
          await api.put(`/cards/${cardData.id}`, updatedCard);

          // Notify parent component
          if (onUpdate) {
            onUpdate(updatedCard);
          }
          
          // Emit socket event
          if (cardData?.board_id) {
            emitBoardChange(cardData.board_id, 'card_updated', updatedCard);
          }
          
          onClose();
        } catch (error) {
          console.error('Failed to archive card', error);
        } finally {
          setLoading(false);
          setIsConfirmOpen(false);
        }
      },
      () => {
        setIsConfirmOpen(false);
      }
    );
  };

  return (
    <div className="relative" >
      <button
        onClick={() => setShowActionDropdown(!showActionDropdown)}
        className={`p-1.5 rounded-full transition-colors ${
          hasCover
            ? 'bg-black/30 hover:bg-black/50 text-white' 
            : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
        }`}
        title="Card actions"
        disabled={loading}
      >
        <FiMoreHorizontal className="w-4 h-4" />
      </button>
      
      {showActionDropdown && (
        <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-30">
          <button
            className="w-full text-left px-3 py-2 text-sm flex items-center hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleMoveCard}
          >
            <FiMove className="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            Move card
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm flex items-center hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleCopyCard}
          >
            <FiCopy className="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            Copy card
          </button>
          <button
            className="w-full text-left px-3 py-2 text-sm flex items-center hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleToggleWatch}
          >
            <FiEye className="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400" />
            {isWatching ? 'Unwatch' : 'Watch'}
          </button>
          <hr className="my-1 border-gray-200 dark:border-gray-700" />
          <button
            className="w-full text-left px-3 py-2 text-sm flex items-center text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={handleArchiveCard}
          >
            <FiArchive className="mr-2 w-4 h-4" />
            Archive
          </button>
        </div>
      )}
    </div>
  );
};

export default CardActions;