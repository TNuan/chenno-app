import React, { useState, useRef, useEffect } from 'react';
import { FiMoreHorizontal, FiMove, FiCopy, FiEye, FiArchive, FiTrash2 } from 'react-icons/fi';
import { archiveCard } from '../../services/api';
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
      'Archive Card',
      'Thẻ này sẽ được lưu trữ và ẩn khỏi bảng. Bạn có thể khôi phục nó bất cứ lúc nào.',
      async () => {
        setLoading(true);
        try {
          await archiveCard(cardData.id);

          // Notify parent component that card was archived
          if (onUpdate) {
            onUpdate(null, true); // true indicates card should be removed from view
          }
          
          onClose();
        } catch (error) {
          console.error('Failed to archive card', error);
          alert('Archive card thất bại. Vui lòng thử lại.');
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
          className="flex items-center justify-center w-8 h-8 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Actions"
        >
          <FiMoreHorizontal className="w-4 h-4" />
        </button>
        
        {showActionDropdown && (
          <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-30">
            {canModify && (
              <>
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
                
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                
                <button
                  className="w-full text-left px-3 py-2 text-sm flex items-center hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={handleArchiveCard}
                >
                  <FiArchive className="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400" />
                  Archive card
                </button>
              </>
            )}
            
            <button
              className="w-full text-left px-3 py-2 text-sm flex items-center hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleToggleWatch}
            >
              <FiEye className="mr-2 w-4 h-4 text-gray-500 dark:text-gray-400" />
              {isWatching ? 'Unwatch' : 'Watch'}
            </button>
            
            {canModify && (
              <>
                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                <button
                  className="w-full text-left px-3 py-2 text-sm flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400"
                  onClick={() => console.log('Delete card action triggered')}
                >
                  <FiTrash2 className="mr-2 w-4 h-4" />
                  Delete card
                </button>
              </>
            )}
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