import React, { useState, useRef } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import LabelSelector from './LabelSelector';
import { getContrastTextColor } from './LabelSelector';
import api from '../../services/api';
import { emitBoardChange } from '../../services/socket';

const LabelDisplay = ({ cardData, boardId, canModify, onUpdate }) => {
  const [showLabelSelector, setShowLabelSelector] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const labelButtonRef = useRef(null);

  const handleLabelUpdate = (updatedCard) => {
    onUpdate(updatedCard);
  };

  const handleRemoveLabel = async (labelId) => {
    if (isRemoving) return;
    
    setIsRemoving(true);
    try {
      // Gọi API để remove label from card
      await api.delete(`/labels/card/${cardData.id}/${labelId}`);
      
      // Cập nhật state local
      const updatedCard = {
        ...cardData,
        labels: cardData.labels.filter(l => l.id !== labelId)
      };
      onUpdate(updatedCard);
      
    } catch (error) {
      console.error('Failed to remove label from card:', error);
      // Có thể hiển thị toast error ở đây
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium">
          Labels
        </h4>
        {canModify && (
          <button
            ref={labelButtonRef}
            onClick={() => setShowLabelSelector(!showLabelSelector)}
            className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
            title="Add/remove labels"
          >
            <FiPlus className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      
      {cardData?.labels && cardData.labels.length > 0 ? (
        <div className="flex flex-wrap gap-1 mt-1">
          {cardData.labels.map(label => (
            <div
              key={label.id}
              className="group relative rounded overflow-hidden"
            >
              <span
                className="inline-block px-2.5 py-0.5 text-xs rounded"
                style={{ 
                  backgroundColor: label.color,
                  color: getContrastTextColor(label.color)
                }}
              >
                {label.name}
              </span>
              
              {canModify && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveLabel(label.id);
                  }}
                  disabled={isRemoving}
                  className={`absolute right-0 top-0 h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-1 hover:bg-black/20 ${
                    isRemoving ? 'cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  style={{ 
                    color: getContrastTextColor(label.color)
                  }}
                  title="Remove label"
                >
                  {isRemoving ? (
                    <div className="w-3 h-3 animate-spin border border-current border-t-transparent rounded-full"></div>
                  ) : (
                    <FiX className="w-3 h-3" />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          No labels
        </p>
      )}
      
      <LabelSelector 
        isOpen={showLabelSelector}
        onClose={() => setShowLabelSelector(false)}
        cardData={cardData}
        boardId={boardId}
        onUpdate={handleLabelUpdate}
        position="right"
        buttonRef={labelButtonRef}
      />
    </div>
  );
};

export default LabelDisplay;