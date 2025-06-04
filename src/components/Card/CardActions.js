import React, { useState, useRef, useEffect } from 'react';
import { FiMoreHorizontal, FiMove, FiCopy, FiEye, FiArchive } from 'react-icons/fi';
import api from '../../services/api';
import { emitBoardChange } from '../../services/socket';
import { useAlert } from '../../contexts/AlertContext';
import MoveCardModal from './MoveCardModal';
import CopyCardModal from './CopyCardModal';

const CardActions = ({ 
  cardData, 
  onClose, 
  onUpdate, 
  hasCover = false, 
  canModify = false 
}) => {
  const [showActionDropdown, setShowActionDropdown] = useState(false);
  const actionDropdownRef = useRef(null);
  const [isWatching, setIsWatching] = useState(false);
  const { showConfirm } = useAlert();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Thêm state cho modal move card
  const [showMoveCardModal, setShowMoveCardModal] = useState(false);
  // Thêm state cho modal copy card
  const [showCopyCardModal, setShowCopyCardModal] = useState(false);

  // Xử lý click outside cho dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target)) {
        setShowActionDropdown(false);
      }
    };
    
    // Chỉ thêm event listener khi dropdown đang mở
    if (showActionDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showActionDropdown]);

  // Xử lý các hành động
  const handleMoveCard = () => {
    setShowActionDropdown(false);
    setShowMoveCardModal(true);
  };

  const handleMoveCardComplete = (updatedCard, changedBoard) => {
    // Nếu card được chuyển sang board khác, đóng card detail
    if (changedBoard) {
      onClose();
    } else {
      // Nếu chỉ chuyển column trong cùng board, cập nhật card data
      if (onUpdate) {
        onUpdate(updatedCard);
      }
      
    //   // Emit socket event
    //   if (cardData?.board_id) {
    //     emitBoardChange(cardData.board_id, 'card_updated', updatedCard);
    //   }
    }
  };

  const handleCopyCard = () => {
    setShowActionDropdown(false);
    setShowCopyCardModal(true);
  };

  const handleCopyCardComplete = (copiedCard, changedBoard) => {
    // Nếu card được copy sang board khác, có thể thông báo cho user
    if (changedBoard) {
      // Card được copy sang board khác
      console.log('Card copied to different board');
    } else {
      // Card được copy trong cùng board, cập nhật UI nếu cần
      if (onUpdate) {
        // Có thể emit event để refresh board data
        console.log('Card copied to same board');
      }
    }
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
    <>
      <div className="relative" ref={actionDropdownRef}>
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
      
      {/* Move Card Modal */}
      <MoveCardModal
        isOpen={showMoveCardModal}
        onClose={() => setShowMoveCardModal(false)}
        cardData={cardData}
        onMoveCard={handleMoveCardComplete}
      />

      {/* Copy Card Modal */}
      <CopyCardModal
        isOpen={showCopyCardModal}
        onClose={() => setShowCopyCardModal(false)}
        cardData={cardData}
        onCopyCard={handleCopyCardComplete}
      />
    </>
  );
};

export default CardActions;