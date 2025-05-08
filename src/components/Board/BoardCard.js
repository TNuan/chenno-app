import React, { useState } from "react";
import { FiStar, FiClock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toggleFavoriteBoard } from "../../services/api";
import { toast } from "react-toastify";

const BoardCard = ({ board, isRecentlyViewed, onUpdate }) => {
    const navigate = useNavigate();
    const [isToggling, setIsToggling] = useState(false);

    const handleToggleFavorite = async (e) => {
        e.stopPropagation();
        if (isToggling) return;

        try {
            setIsToggling(true);
            await toggleFavoriteBoard(board.id);
            
            // Update the board's favorite status locally through parent component
            if (onUpdate) {
                onUpdate({
                    ...board,
                    is_favorite: !board.is_favorite
                });
            }

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

    return (
        <div
            onClick={() => navigate(`/b/${board.id}`)}
            className="group relative bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer min-h-[160px] overflow-hidden"
        >
            {/* Board Background */}
            <div
                className="absolute inset-0 rounded-lg opacity-70 group-hover:opacity-85 transition-opacity"
                style={{
                    backgroundColor: board.cover_img || '#4F46E5',
                    backgroundImage: board.cover_img ? `url(${board.cover_img})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            />

            {/* Updated Favorite Button */}
            <div className="relative z-15 flex justify-end p-2">
                <button
                    className={`p-1.5 hover:bg-white/20 rounded bg-white/40 dark:bg-gray-800/30 ${
                        isToggling ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handleToggleFavorite}
                    disabled={isToggling}
                    title={board.is_favorite ? 'Xóa khỏi mục yêu thích' : 'Thêm vào mục yêu thích'}
                >
                    <FiStar 
                        className={`h-5 w-5 ${
                            board.is_favorite
                                ? 'text-yellow-500 fill-current'
                                : 'text-gray-200 hover:text-yellow-500'
                        }`} 
                    />
                </button>
            </div>

            {/* Board Content */}
            <div className="relative z-10 flex flex-col mt-12">
                <div className="mt-auto px-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">
                            {board.name}
                        </h3>
                        {isRecentlyViewed ? (
                            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <FiClock className="mr-1.5 h-4 w-4" />
                                <span>
                                    Last visited {new Date(board.viewed_at).toLocaleString('vi-VN', {
                                        year: 'numeric',
                                        month: 'numeric',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>
                        ) : (
                            <div className="text-sm text-gray-700 dark:text-gray-300">
                                Created {new Date(board.created_at).toLocaleDateString('vi-VN')}
                            </div>
                        )}
                    </div>

                    {board.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">
                            {board.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BoardCard;