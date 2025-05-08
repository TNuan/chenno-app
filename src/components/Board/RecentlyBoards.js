import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecentlyBoards } from '../../services/api';
import { FiClock, FiStar } from 'react-icons/fi';
import BoardCard from './BoardCard';

const RecentlyBoards = ({ allBoardsUser, handleBoardUpdate }) => {
  const [recentBoards, setRecentBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const listRecentlyBoards = allBoardsUser
      .flatMap(workspace => workspace.boards)
      .filter(board => board.viewed_at !== null)
      .sort((a, b) => new Date(b.viewed_at) - new Date(a.viewed_at))
      .slice(0, 5);
    setRecentBoards(listRecentlyBoards);
    setIsLoading(false);
  }, [allBoardsUser]);

  // useEffect(() => {
  //   const fetchRecentBoards = async () => {
  //     try {
  //       const response = await getRecentlyBoards();
  //       setRecentBoards(response.boards);
  //       setIsLoading(false);
  //     } catch (err) {
  //       setError('Failed to load recent boards');
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchRecentBoards();
  // }, []);

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

  if (recentBoards.length === 0) {
    return (
      <div className="text-center py-8">
        <FiClock className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No recent boards</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Your recently viewed boards will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {recentBoards.map((board) => (
        <BoardCard
          key={board.id}
          board={board}
          isRecentlyViewed={true}
          onUpdate={handleBoardUpdate}
          onClick={() => navigate(`/board/${board.id}`)}
        />
      ))}
    </div>
  );
};

export default RecentlyBoards;