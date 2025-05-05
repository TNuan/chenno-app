import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBoards } from '../../services/api';
import { FiStar, FiFolder, FiPlus } from 'react-icons/fi';

const BoardListByWorkspace = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await getAllBoards();
        setWorkspaces(response.listBoards);
        setIsLoading(false);
      } catch (err) {
        setError('Failed to load boards');
        setIsLoading(false);
      }
    };

    fetchBoards();
  }, []);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-8">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, idx) => (
                <div key={idx} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              ))}
            </div>
          </div>
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

  return (
    <div className="space-y-8">
      {workspaces.map((workspace) => (
        <div key={workspace.id} className="space-y-4">
          {/* Workspace Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate(`/w/${workspace.id}`)}>
              <FiFolder className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                {workspace.name}
              </h2>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({workspace.boards.length})
              </span>
            </div>
            <button 
              onClick={() => navigate(`/w/${workspace.id}/create-board`)}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <FiPlus className="h-4 w-4" />
              <span>Add Board</span>
            </button>
          </div>

          {/* Boards Grid */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {workspace.boards.map((board) => (
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

                  {/* Created Date */}
                  <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                    Created {new Date(board.created_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BoardListByWorkspace;