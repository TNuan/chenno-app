import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllBoards } from '../../services/api';
import { FiStar, FiFolder, FiPlus, FiTrello, FiUsers, FiSettings } from 'react-icons/fi';
import CreateBoardModal from './CreateBoardModal';
import BoardCard from './BoardCard';

const AllBoardsUser = ({ allBoardsUser, handleBoardUpdate }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const handleBoardCreated = (board) => {
    // Update your boards list or trigger a refresh
    // You might want to refetch the boards list here
  };
  // if (allBoardsUser) {
  //   setIsLoading(false);
  // }

  // if (isLoading) {
  //   return (
  //     <div className="animate-pulse space-y-8">
  //       {[...Array(2)].map((_, workspaceIndex) => (
  //         <div key={`workspace-skeleton-${workspaceIndex}`} className="space-y-4">
  //           <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
  //           <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  //             {[...Array(3)].map((_, boardIndex) => (
  //               <div
  //                 key={`board-skeleton-${workspaceIndex}-${boardIndex}`}
  //                 className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
  //               />
  //             ))}
  //           </div>
  //         </div>
  //       ))}
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="text-center py-4 text-gray-500 dark:text-gray-400">
  //       {error}
  //     </div>
  //   );
  // }

  return (
    <div className="space-y-8">
      {allBoardsUser.map((workspace) => (
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
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  navigate(`/w/${workspace.id}/boards`);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 bg-gray-200 dark:bg-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <FiTrello className="h-4 w-4" />
                <span>Boards</span>
              </button>
              <button
                onClick={() => {
                  navigate(`/w/${workspace.id}/members`);
                }}
                className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 bg-gray-200 dark:bg-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <FiUsers className="h-4 w-4" />
                <span>Members</span>
              </button>

              {
                workspace.role === 'owner' && (
                  <button
                    onClick={() => {
                      navigate(`/w/${workspace.id}/settings`)
                    }}
                    className="flex items-center space-x-1 px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 bg-gray-200 dark:bg-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <FiSettings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>
                )
              }

              { (workspace.role === 'owner' || workspace.role === 'admin') && (
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
              )}
            </div>
          </div>

          {/* Boards Grid */}
          {workspace.boards.length > 0 && (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {workspace.boards.map((board) => (
                <BoardCard 
                  key={board.id} 
                  board={board}
                  isRecentlyViewed={false}
                  onUpdate={handleBoardUpdate}
                />
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

export default AllBoardsUser;