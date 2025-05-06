import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBoards } from '../../services/api';
import { FiStar, FiFolder, FiPlus } from 'react-icons/fi';
import CreateBoardModal from './CreateBoardModal';

const BoardListByWorkspace = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const handleBoardCreated = (board) => {
    // Update your boards list or trigger a refresh
    // You might want to refetch the boards list here
  };

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
        {[...Array(2)].map((_, workspaceIndex) => (
          <div key={`workspace-skeleton-${workspaceIndex}`} className="space-y-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, boardIndex) => (
                <div 
                  key={`board-skeleton-${workspaceIndex}-${boardIndex}`} 
                  className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
                />
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
      {workspaces.map((workspace, index) => (
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
              onClick={() => {
                setSelectedWorkspace(workspace.id);
                setIsModalOpen(true)
              }}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              <FiPlus className="h-4 w-4" />
              <span>Add Board</span>
            </button>
          </div>

          {/* Boards Grid */}
          {workspace.boards.length > 0 && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {workspace.boards.map((board) => (
              <div
                key={board.id}
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

                {/* Favorite Button */}
                <div className="relative z-15 flex justify-end p-2">
                  <button 
                    className="p-1.5 hover:bg-white/20 rounded bg-white/40 dark:bg-gray-800/30"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add favorite logic here
                    }}
                  >
                    <FiStar className={`h-5 w-5 ${
                      board.is_favorite 
                        ? 'text-yellow-500 fill-current' 
                        : 'text-gray-200 hover:text-yellow-500'
                    }`} />
                  </button>
                </div>

                {/* Board Content */}
                <div className="relative z-10 flex flex-col mt-12">
                  <div className="mt-auto px-3 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-1">
                        {board.name}
                      </h3>
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        Created {new Date(board.created_at).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    

                    {board.description && (
                      <p className="text-sm text-gray-700 dark:text-gray-200 mb-2">
                        {board.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
      )}   
        </div>
      ))}

      <CreateBoardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onBoardCreated={handleBoardCreated}
        workspaceId={selectedWorkspace}
      />
    </div>
  );
};

export default BoardListByWorkspace;