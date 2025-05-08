import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBoardsByWorkspace } from '../../services/api';
import { FiGrid, FiStar } from 'react-icons/fi';
import BoardCard from './BoardCard';
import CreateBoardModal from './CreateBoardModal';

const BoardsByWorkspace = ({ workspaceId }) => {
  const [boards, setBoards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isModalCreateBoardOpen, setIsModalCreateBoardOpen] = useState(false);
  const handleBoardCreated = (board) => {
    setBoards((prevBoards) => [...prevBoards, board]);
    setIsModalCreateBoardOpen(false);
  };

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
          onClick={() => setIsModalCreateBoardOpen(true)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Create Board
        </button>
        <CreateBoardModal
          isOpen={isModalCreateBoardOpen}
          onClose={() => setIsModalCreateBoardOpen(false)}
          onBoardCreated={handleBoardCreated}
          workspaceId={workspaceId}
        />
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
      <CreateBoardModal
        isOpen={isModalCreateBoardOpen}
        onClose={() => setIsModalCreateBoardOpen(false)}
        onBoardCreated={handleBoardCreated}
        workspaceId={workspaceId}
      />
    </div>
  );
};

export default BoardsByWorkspace;