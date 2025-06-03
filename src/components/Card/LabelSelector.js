import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiCheck, FiPlus, FiX } from 'react-icons/fi';
import api from '../../services/api';
import { emitBoardChange } from '../../services/socket';

// Các màu cho label mới
const labelColorOptions = [
  '#FF5733', // Đỏ cam
  '#33FF57', // Xanh lá
  '#3357FF', // Xanh dương
  '#FF33A8', // Hồng
  '#33FFF6', // Xanh ngọc
  '#F6FF33', // Vàng
  '#FF33F6', // Tím hồng
  '#808080', // Xám
  '#FFA500', // Cam
  '#800080', // Tím
  '#008000', // Xanh lá đậm
  '#000080', // Xanh dương đậm
  '#FF0000', // Đỏ
  '#0000FF', // Xanh dương
  '#FFFF00', // Vàng tươi
];

// Utility function to determine text color for label based on background color
const getContrastTextColor = (bgColor) => {
  // Remove # if present
  const hex = bgColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance - using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

const LabelSelector = ({ 
  isOpen, 
  onClose, 
  cardData, 
  boardId, 
  onUpdate,
  position = 'right',
  buttonRef = null
}) => {
  const [boardLabels, setBoardLabels] = useState([]);
  const [isAddingNewLabel, setIsAddingNewLabel] = useState(false);
  const [newLabel, setNewLabel] = useState({ name: '', color: '#808080' });
  const [loadingLabels, setLoadingLabels] = useState(false);

  // Fetch labels when component mounts
  useEffect(() => {
    if (isOpen && boardId) {
      fetchBoardLabels(boardId);
    }
  }, [isOpen, boardId]);

  const fetchBoardLabels = async (boardId) => {
    setLoadingLabels(true);
    try {
      const response = await api.get(`/labels/board/${boardId}`);
      setBoardLabels(response.data.labels || []);
    } catch (error) {
      console.error('Failed to fetch board labels:', error);
    } finally {
      setLoadingLabels(false);
    }
  };

  const toggleCardLabel = async (labelId) => {
    const hasLabel = cardData?.labels?.some(label => label.id === labelId);
    
    try {
      setLoadingLabels(true);
      
      if (hasLabel) {
        // Remove label from card
        await api.delete(`/labels/card/${cardData.id}/${labelId}`);
        
        // Update local card state in parent
        onUpdate({
          ...cardData,
          labels: cardData.labels.filter(label => label.id !== labelId)
        });
      } else {
        // Add label to card
        await api.post('/labels/card', {
          card_id: cardData.id,
          label_id: labelId
        });
        
        // Get label info from boardLabels
        const addedLabel = boardLabels.find(label => label.id === labelId);
        
        // Update local card state in parent
        onUpdate({
          ...cardData,
          labels: [...(cardData.labels || []), addedLabel]
        });
      }
      
      // Emit socket event
      if (cardData && cardData.board_id) {
        emitBoardChange(cardData.board_id, 'card_updated', cardData);
      }
    } catch (error) {
      console.error('Failed to update card labels:', error);
    } finally {
      setLoadingLabels(false);
    }
  };

  const createNewLabel = async () => {
    if (!newLabel.name.trim()) return;
    
    try {
      setLoadingLabels(true);
      
      // Create new label
      const response = await api.post('/labels', {
        board_id: boardId,
        name: newLabel.name.trim(),
        color: newLabel.color
      });
      
      const createdLabel = response.data.label;
      
      // Add to board labels
      setBoardLabels(prev => [...prev, createdLabel]);
      
      // Add to card
      await toggleCardLabel(createdLabel.id);
      
      // Reset form
      setNewLabel({ name: '', color: '#808080' });
      setIsAddingNewLabel(false);
    } catch (error) {
      console.error('Failed to create new label:', error);
    } finally {
      setLoadingLabels(false);
    }
  };

  if (!isOpen) return null;
  
  // Vị trí mặc định của LabelSelector sẽ được tính toán dựa trên buttonRef
  const selectorStyle = {};
  
  if (buttonRef && buttonRef.current) {
    const rect = buttonRef.current.getBoundingClientRect();
    
    if (position === 'right') {
      selectorStyle.left = `${rect.right + 8}px`;  // 8px offset để tạo khoảng cách
      selectorStyle.top = `${rect.top}px`;
    } else if (position === 'left') {
      selectorStyle.right = `${window.innerWidth - rect.left + 8}px`;
      selectorStyle.top = `${rect.top}px`;
    } else if (position === 'bottom') {
      selectorStyle.left = `${rect.left}px`;
      selectorStyle.top = `${rect.bottom + 8}px`;
    }
  }
  
  // Sử dụng createPortal để render LabelSelector vào document.body
  return createPortal(
    <div 
      className="fixed bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 z-[100] w-64"
      style={selectorStyle}
    >
      <div className="flex justify-between items-center mb-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Labels</h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <FiX className="w-4 h-4" />
        </button>
      </div>

      {loadingLabels ? (
        <div className="py-4 flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="max-h-48 overflow-y-auto">
            {boardLabels.length > 0 ? (
              <div className="space-y-1">
                {boardLabels.map(label => {
                  const isSelected = cardData?.labels?.some(l => l.id === label.id);
                  
                  return (
                    <div 
                      key={label.id} 
                      className={`flex items-center p-1.5 rounded cursor-pointer ${
                        isSelected ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                      }`}
                      onClick={() => toggleCardLabel(label.id)}
                    >
                      <div 
                        className="w-8 h-4 rounded mr-2 flex-shrink-0" 
                        style={{ backgroundColor: label.color }}
                      ></div>
                      <span className="text-xs text-gray-800 dark:text-gray-200 flex-1">{label.name}</span>
                      {isSelected && <FiCheck className="w-4 h-4 text-blue-500" />}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-3 text-gray-500 dark:text-gray-400 text-xs">
                No labels available for this board
              </div>
            )}
          </div>

          {isAddingNewLabel ? (
            <div className="mt-2 border-t pt-2 border-gray-200 dark:border-gray-700">
              <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Create new label</h4>
              <input
                type="text"
                className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-2"
                placeholder="Label name"
                value={newLabel.name}
                onChange={(e) => setNewLabel(prev => ({ ...prev, name: e.target.value }))}
                autoFocus
              />
              
              <div className="flex flex-wrap gap-1 mb-2">
                {labelColorOptions.map(color => (
                  <div
                    key={color}
                    className={`w-5 h-5 rounded cursor-pointer ${
                      newLabel.color === color ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setNewLabel(prev => ({ ...prev, color }))}
                  ></div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  onClick={() => {
                    setIsAddingNewLabel(false);
                    setNewLabel({ name: '', color: '#808080' });
                  }}
                >
                  Cancel
                </button>
                <button
                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                  onClick={createNewLabel}
                  disabled={!newLabel.name.trim() || loadingLabels}
                >
                  Create
                </button>
              </div>
            </div>
          ) : (
            <button
              className="w-full mt-2 px-2 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors flex items-center justify-center"
              onClick={() => setIsAddingNewLabel(true)}
            >
              <FiPlus className="w-3 h-3 mr-1" /> Create a new label
            </button>
          )}
        </>
      )}
    </div>,
    document.body
  );
};

export default LabelSelector;

// Để sử dụng ở các nơi khác nếu cần
export { getContrastTextColor };