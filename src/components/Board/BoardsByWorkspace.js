import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBoardsByWorkspace } from '../../services/api';
import { FiGrid, FiStar } from 'react-icons/fi';

const BoardsByWorkspace = ({ workspaceId }) => {
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await getBoardsByWorkspace(workspaceId);
        setBoards(response.boards);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load workspace boards');
        setIsLoading(false);
      }
    };

    if (workspaceId) {
      fetchBoards();
    }
  }, [workspaceId]);

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

  if (boards.length === 0) {
    return (
      <div className="text-center py-8">
        <FiGrid className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          No boards found
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Get started by creating a new board
        </p>
        <button
          onClick={() => navigate(`/w/${workspaceId}/create-board`)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Create Board
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => (
        <div
          key={board.id}
          onClick={() => navigate(`/b/${board.id}`)}
          className="group relative bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-4 cursor-pointer"
        >
          {/* Board Background */}
          <div 
            className="absolute inset-0 rounded-lg opacity-20 group-hover:opacity-30 transition-opacity"
            style={{ 
              backgroundColor: board.cover_img || '#4F46E5',
              backgroundImage: board.cover_img ? `url(${board.cover_img})` : 'none'
            }}
          />

          {/* Board Content */}
          <div className="relative">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {board.name}
              </h3>
              <button 
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  // Add favorite logic here
                }}
              >
                <FiStar className={`h-5 w-5 ${
                  board.is_favorite 
                    ? 'text-yellow-400 fill-current' 
                    : 'text-gray-400 hover:text-yellow-400'
                }`} />
              </button>
            </div>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {board.description || 'No description'}
            </p>

            {/* Creation Date */}
            <div className="mt-4 flex items-center text-sm text-gray-500 dark:text-gray-400">
              <span>
                Created {new Date(board.created_at).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BoardsByWorkspace;