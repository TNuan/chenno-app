import React, { useState, useEffect } from 'react';
import { FiX, FiCopy, FiCheck } from 'react-icons/fi';
import api from '../../services/api';

const CopyCardModal = ({ isOpen, onClose, cardData, onCopyCard }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState('');
  const [boards, setBoards] = useState([]);
  const [selectedBoard, setSelectedBoard] = useState('');
  const [columns, setColumns] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState('');
  const [copyLabels, setCopyLabels] = useState(true);
  const [copyAttachments, setCopyAttachments] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch workspaces when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchWorkspaces();
    }
  }, [isOpen]);

  // Fetch boards when workspace changes
  useEffect(() => {
    if (selectedWorkspace) {
      fetchBoards(selectedWorkspace);
      setSelectedBoard('');
      setSelectedColumn('');
    }
  }, [selectedWorkspace]);

  // Fetch columns when board changes
  useEffect(() => {
    if (selectedBoard) {
      fetchColumns(selectedBoard);
      setSelectedColumn('');
    }
  }, [selectedBoard]);

  const fetchWorkspaces = async () => {
    try {
      const response = await api.get('/workspaces');
      setWorkspaces(response.data.workspaces || []);
    } catch (error) {
      console.error('Failed to fetch workspaces:', error);
    }
  };

  const fetchBoards = async (workspaceId) => {
    try {
      const response = await api.get(`/boards/${workspaceId}`);
      setBoards(response.data.boards || []);
    } catch (error) {
      console.error('Failed to fetch boards:', error);
    }
  };

  const fetchColumns = async (boardId) => {
    try {
      const response = await api.get(`/columns/${boardId}`);
      setColumns(response.data.columns || []);
    } catch (error) {
      console.error('Failed to fetch columns:', error);
    }
  };

  const handleCopy = async () => {
    if (!selectedColumn) {
      alert('Vui lòng chọn cột đích');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post(`/cards/copy/${cardData.id}`, {
        target_column_id: selectedColumn,
        copy_labels: copyLabels,
        copy_attachments: copyAttachments
      });

      const copiedCard = response.data.card;
      
      // Kiểm tra xem có copy sang board khác không
      const targetBoard = boards.find(b => b.id.toString() === selectedBoard);
      const currentBoard = cardData.board_id;
      const changedBoard = targetBoard && targetBoard.id !== currentBoard;

      if (onCopyCard) {
        onCopyCard(copiedCard, changedBoard);
      }

      onClose();
    } catch (error) {
      console.error('Failed to copy card:', error);
      alert('Copy card thất bại. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedWorkspace('');
    setSelectedBoard('');
    setSelectedColumn('');
    setCopyLabels(true);
    setCopyAttachments(true);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Copy Card
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Card title display */}
          <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-white">
              {cardData?.title}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              in list {cardData?.column_name}
            </p>
          </div>

          {/* Workspace selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Workspace
            </label>
            <select
              value={selectedWorkspace}
              onChange={(e) => setSelectedWorkspace(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select workspace...</option>
              {workspaces.map((workspace) => (
                <option key={workspace.id} value={workspace.id}>
                  {workspace.name}
                </option>
              ))}
            </select>
          </div>

          {/* Board selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Board
            </label>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              disabled={!selectedWorkspace}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            >
              <option value="">Select board...</option>
              {boards.map((board) => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
          </div>

          {/* Column selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              List
            </label>
            <select
              value={selectedColumn}
              onChange={(e) => setSelectedColumn(e.target.value)}
              disabled={!selectedBoard}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
            >
              <option value="">Select list...</option>
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>
          </div>

          {/* Copy options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Copy options
            </h4>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={copyLabels}
                onChange={(e) => setCopyLabels(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Copy labels
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={copyAttachments}
                onChange={(e) => setCopyAttachments(e.target.checked)}
                className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Copy attachments
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleCopy}
            disabled={!selectedColumn || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Copying...
              </>
            ) : (
              <>
                <FiCopy className="mr-2 h-4 w-4" />
                Copy Card
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopyCardModal;