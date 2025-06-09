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
            className="group relative bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer h-[200px] overflow-hidden"
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

            {/* Favorite Button */}
            <div className="relative z-15 flex justify-end p-3">
                <button
                    className={`p-1.5 hover:bg-white/20 rounded-full bg-white/20 dark:bg-gray-800/30 backdrop-blur-sm ${
                        isToggling ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    onClick={handleToggleFavorite}
                    disabled={isToggling}
                    title={board.is_favorite ? 'Xóa khỏi mục yêu thích' : 'Thêm vào mục yêu thích'}
                >
                    <FiStar 
                        className={`h-4 w-4 ${
                            board.is_favorite
                                ? 'text-yellow-400 fill-current'
                                : 'text-white hover:text-yellow-400'
                        }`} 
                    />
                </button>
            </div>

            {/* Board Content - Fixed height at bottom */}
            <div className="absolute bottom-0 left-0 right-0 z-10">
                <div className="px-4 py-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-b-lg h-20 flex flex-col justify-between">
                    {/* Top section - Name and description */}
                    <div className="flex-1 min-h-0">
                        {/* Board Name - Always visible, truncated if too long */}
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate leading-tight" title={board.name}>
                            {board.name}
                        </h3>

                        {/* Description - Max 1 line with ellipsis */}
                        {board.description && (
                            <p className="text-sm text-gray-700 dark:text-gray-300 truncate leading-tight mt-0.5" title={board.description}>
                                {board.description}
                            </p>
                        )}
                    </div>

                    {/* Bottom section - Time info - Always at bottom */}
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {isRecentlyViewed ? (
                            <>
                                <FiClock className="mr-1 h-3 w-3 flex-shrink-0" />
                                <span className="truncate">
                                    Last visited {new Date(board.viewed_at).toLocaleString('vi-VN', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </>
                        ) : (
                            <span className="truncate">
                                Tạo ngày {new Date(board.created_at).toLocaleDateString('vi-VN')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Gradient overlay for better text readability */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-5"></div>
        </div>
    );
}

export default BoardCard;