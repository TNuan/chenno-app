import React, { useState, useRef, useEffect } from 'react';
import {
  FiStar, FiMoreHorizontal, FiUsers,
  FiLock, FiGlobe, FiUserPlus, FiChevronDown
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { toggleFavoriteBoard, updateBoard } from '../../services/api';
import { toast } from 'react-toastify';
import { createEditableProps } from '../../utils/contentEditable';

const BoardBar = ({ board, onUpdate, userRole }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [boardTitle, setBoardTitle] = useState(board.name);
  const [isVisibilityMenuOpen, setIsVisibilityMenuOpen] = useState(false);
  
  const menuRef = useRef(null);
  const visibilityMenuRef = useRef(null);
  const navigate = useNavigate();
  
  const canEdit = board.user_role === 'owner' || board.user_role === 'admin';

  // Handle click outside for main menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
      if (visibilityMenuRef.current && !visibilityMenuRef.current.contains(event.target)) {
        setIsVisibilityMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    if (isToggling) return;

    try {
      setIsToggling(true);
      await toggleFavoriteBoard(board.id);
      onUpdate({
        ...board,
        is_favorite: !board.is_favorite
      });
      toast.success(
        board.is_favorite
          ? 'Đã xóa khỏi danh sách yêu thích'
          : 'Đã thêm vào danh sách yêu thích'
      );
    } catch (error) {
      console.error('Toggle favorite failed:', error);
      toast.error('Không thể cập nhật trạng thái yêu thích');
    } finally {
      setIsToggling(false);
    }
  };

  const handleBoardTitleChange = (e) => {
    setBoardTitle(e.target.value);
  };

  const handleBoardTitleSubmit = async () => {
    if (!boardTitle.trim() || boardTitle.trim() === board.name) {
      setBoardTitle(board.name);
      setIsEditingTitle(false);
      return;
    }

    try {
      const updatedBoard = await updateBoard(board.id, { name: boardTitle.trim() });
      onUpdate({
        ...board,
        name: boardTitle.trim()
      });
      toast.success('Đã cập nhật tên bảng');
    } catch (error) {
      console.error('Update board title failed:', error);
      toast.error('Không thể cập nhật tên bảng');
      setBoardTitle(board.name);
    } finally {
      setIsEditingTitle(false);
    }
  };

  const handleBoardTitleCancel = () => {
    setBoardTitle(board.name);
    setIsEditingTitle(false);
  };

  const handleVisibilityChange = async (visibility) => {
    if (visibility === board.visibility) {
      setIsVisibilityMenuOpen(false);
      return;
    }

    try {
      const updatedBoard = await updateBoard(board.id, { visibility });
      onUpdate({
        ...board,
        visibility
      });
      toast.success('Đã cập nhật quyền riêng tư của bảng');
    } catch (error) {
      console.error('Update board visibility failed:', error);
      toast.error('Không thể cập nhật quyền riêng tư');
    } finally {
      setIsVisibilityMenuOpen(false);
    }
  };

  // Get editable props from utility function
  const editableProps = createEditableProps(
    boardTitle,
    handleBoardTitleChange,
    handleBoardTitleSubmit,
    handleBoardTitleCancel
  );

  return (
    <div className="flex items-center justify-between px-3 py-1 bg-black/25 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        
        {/* Board Title */}
        {isEditingTitle && canEdit ? (
          <input 
            {...editableProps} 
            className="px-2 py-1 text-base font-medium text-white bg-white/20 rounded border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ) : (
          <h1 
            className={`text-base font-medium text-white px-2 py-1 ${canEdit ? 'cursor-pointer  rounded hover:bg-white/10' : ''}`}
            onClick={() => canEdit && setIsEditingTitle(true)}
            title={canEdit ? "Click to edit board title" : ""}
          >
            {board.name}
          </h1>
        )}

        {/* Visibility Badge */}
        <div className="relative" ref={visibilityMenuRef}>
          <button
            onClick={() => canEdit && setIsVisibilityMenuOpen(!isVisibilityMenuOpen)}
            className={`flex items-center px-1.5 py-0.5 rounded bg-white/20 text-white text-xs ${canEdit ? 'hover:bg-white/30 cursor-pointer' : 'cursor-default'}`}
            title={canEdit ? "Click to change visibility" : "Board visibility"}
            disabled={!canEdit}
          >
            {board.visibility === 'private' ? (
              <>
                <FiLock className="w-3 h-3 mr-1" />
                Private
              </>
            ) : (
              <>
                <FiGlobe className="w-3 h-3 mr-1" />
                Public
              </>
            )}
            {canEdit && <FiChevronDown className="w-3 h-3 ml-1" />}
          </button>

          {isVisibilityMenuOpen && canEdit && (
            <div className="absolute left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
              <button
                onClick={() => handleVisibilityChange('private')}
                className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${board.visibility === 'private' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <FiLock className="w-4 h-4 mr-2" />
                Private
                <span className="ml-2 text-xs text-gray-500">
                  (Chỉ thành viên)
                </span>
              </button>
              <button
                onClick={() => handleVisibilityChange('public')}
                className={`flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${board.visibility === 'public' ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
              >
                <FiGlobe className="w-4 h-4 mr-2" />
                Public
                <span className="ml-2 text-xs text-gray-500">
                  (Mọi người)
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleToggleFavorite}
          disabled={isToggling}
          className={`p-1 rounded hover:bg-white/20 transition-colors ${isToggling ? 'opacity-50 cursor-not-allowed' : ''}`}
          title={board.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <FiStar
            className={`w-4 h-4 ${board.is_favorite
              ? 'text-yellow-400 fill-current'
              : 'text-white'
            }`}
          />
        </button>
      </div>

      {/* View-only notification banner */}
            {!canEdit && (
                <div className=" text-yellow-200 px-4 py-2 flex items-center justify-center text-sm font-medium">
                    <FiLock className="mr-2" /> 
                    Bạn đang xem bảng này ở chế độ chỉ đọc. Chỉ thành viên mới có thể chỉnh sửa.
                </div>
            )}

      {/* Right Section */}
      <div className="flex items-center space-x-1.5">
        {/* Members Button */}
        <button
          onClick={() => { }}
          className="flex items-center px-2 py-1 text-white hover:bg-white/20 rounded transition-colors"
        >
          <FiUsers className="w-3.5 h-3.5 mr-1" />
          <span className="text-xs">Members</span>
        </button>

        {/* Share Button */}
        <button
          onClick={() => { }}
          className="flex items-center px-2 py-1 text-white bg-white/20 hover:bg-white/30 rounded transition-colors"
        >
          <FiUserPlus className="w-3.5 h-3.5 mr-1" />
          <span className="text-xs">Share</span>
        </button>

        {/* More Options */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1 text-white hover:bg-white/20 rounded transition-colors"
          >
            <FiMoreHorizontal className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
              {/* Add menu items here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BoardBar;