import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFavoriteBoards } from '../../services/api';
import { FiStar } from 'react-icons/fi';
import BoardCard from './BoardCard';

const FavoriteBoards = ({allBoardsUser, handleBoardUpdate}) => {
  const [favoriteBoards, setFavoriteBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const listFavoriteBoards = allBoardsUser.flatMap(workspace => workspace.boards).filter(board => board.is_favorite);
    setFavoriteBoards(listFavoriteBoards);
    setIsLoading(false);
  }, [allBoardsUser]);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
        {error}
      </div>
    );
  }

  if (favoriteBoards.length === 0) {
    return (
      <div className="text-center py-8">
        <FiStar className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No favorite boards</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Your favorite boards will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {favoriteBoards.map((board) => (
        <BoardCard
          key={board.id}
          board={board}
          isRecentlyViewed={false}
          onUpdate={handleBoardUpdate}
          onClick={() => navigate(`/board/${board.id}`)}
        />
      ))}
    </div>
  );
};

export default FavoriteBoards;