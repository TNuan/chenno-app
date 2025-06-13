import React, { useState, useRef, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { updateBoard } from '../../services/api';
import { toast } from 'react-toastify';

// Import background images
const backgroundImages = require.context('../../assets/images/bg-boards', false, /\.(png|jpe?g|svg)$/);
const bgImageList = backgroundImages.keys().map(backgroundImages);

const ChangeBackgroundDropdown = ({ isOpen, onClose, board, onUpdate, anchorRef }) => {
  const [selectedBg, setSelectedBg] = useState(board?.cover_img || bgImageList[0]);
  const [isLoading, setIsLoading] = useState(false);
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

  // Position dropdown to match BoardMenu positioning
  const getDropdownPosition = () => {
    if (!anchorRef.current) return {};

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const dropdownHeight = 400; // Estimated height
    const dropdownWidth = 320;
    
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

  const handleBackgroundChange = async (newBackground) => {
    if (newBackground === board.cover_img) {
      setSelectedBg(newBackground);
      return;
    }

    setIsLoading(true);
    try {
      const response = await updateBoard(board.id, { cover_img: newBackground });
      
      // Update board data in parent component
      onUpdate({
        ...board,
        cover_img: newBackground
      });
      
      setSelectedBg(newBackground);
      toast.success('Board background updated successfully');
      onClose();
    } catch (error) {
      console.error('Update board background failed:', error);
      toast.error('Failed to update board background');
      setSelectedBg(board.cover_img);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-80"
      style={getDropdownPosition()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Change Background
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <FiX className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Background Grid */}
      <div className="p-3">
        <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
          {bgImageList.map((bg, index) => (
            <div
              key={index}
              onClick={() => !isLoading && handleBackgroundChange(bg)}
              className={`relative aspect-video rounded cursor-pointer overflow-hidden transition-all duration-200 hover:scale-105 ${
                isLoading ? 'pointer-events-none opacity-50' : ''
              } ${
                selectedBg === bg 
                  ? 'ring-2 ring-blue-500' 
                  : 'hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600'
              }`}
            >
              <img
                src={bg}
                alt={`Background ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {selectedBg === bg && (
                <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>
              )}
              
              {/* Loading overlay */}
              {isLoading && selectedBg === bg && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Click on any background to apply it to your board
        </p>
      </div>
    </div>
  );
};

export default ChangeBackgroundDropdown;