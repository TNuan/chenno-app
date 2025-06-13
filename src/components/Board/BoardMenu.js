import React from 'react';
import {
  FiInfo, FiImage, FiDownload, FiTag, 
  FiArchive, FiXCircle, FiLogOut
} from 'react-icons/fi';

const BoardMenu = ({ 
  isOpen, 
  onClose, 
  board, 
  canEdit, 
  isOwner,
  onAboutBoard,
  onChangeBackground,
  onPrintExport,
  onLabels,
  onArchivedItems,
  onCloseLeavBoard
}) => {
  if (!isOpen) return null;

  const handleMenuItemClick = (handler) => {
    handler();
    // Close menu for all items including change background
    onClose();
  };

  return (
    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-20">
      
      {/* About this board */}
      <button
        onClick={() => handleMenuItemClick(onAboutBoard)}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <FiInfo className="w-4 h-4 mr-3" />
        About this board
      </button>

      {/* Change background - Only for owners/admins */}
      {canEdit && (
        <button
          onClick={() => handleMenuItemClick(onChangeBackground)}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <FiImage className="w-4 h-4 mr-3" />
          Change background
        </button>
      )}

      {/* Divider */}
      <div className="my-1 border-t border-gray-200 dark:border-gray-600"></div>

      {/* Print, export */}
      <button
        onClick={() => handleMenuItemClick(onPrintExport)}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <FiDownload className="w-4 h-4 mr-3" />
        Print, export
      </button>

      {/* Divider */}
      <div className="my-1 border-t border-gray-200 dark:border-gray-600"></div>

      {/* Labels - Only for owners/admins */}
      {canEdit && (
        <button
          onClick={() => handleMenuItemClick(onLabels)}
          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <FiTag className="w-4 h-4 mr-3" />
          Labels
        </button>
      )}

      {/* Archived items */}
      <button
        onClick={() => handleMenuItemClick(onArchivedItems)}
        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <FiArchive className="w-4 h-4 mr-3" />
        Archived items
      </button>

      {/* Divider */}
      <div className="my-1 border-t border-gray-200 dark:border-gray-600"></div>

      {/* Close board (Owner) / Leave board (Admin/Member) */}
      <button
        onClick={() => handleMenuItemClick(onCloseLeavBoard)}
        className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
      >
        {isOwner ? (
          <>
            <FiXCircle className="w-4 h-4 mr-3" />
            Close board
          </>
        ) : (
          <>
            <FiLogOut className="w-4 h-4 mr-3" />
            Leave board
          </>
        )}
      </button>

    </div>
  );
};

export default BoardMenu;