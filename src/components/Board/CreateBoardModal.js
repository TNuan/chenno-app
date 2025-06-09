import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { createBoard, getWorkspaces } from '../../services/api';
import { useNavigate } from 'react-router-dom';

// Import background images
const backgroundImages = require.context('../../assets/images/bg-boards', false, /\.(png|jpe?g|svg)$/);
const bgImageList = backgroundImages.keys().map(backgroundImages);

const CreateBoardModal = ({ isOpen, onClose, onBoardCreated, workspaceId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    workspace_id: workspaceId || '',
    cover_img: bgImageList[0]
  });
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBg, setSelectedBg] = useState(bgImageList[0]);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await getWorkspaces();
        setWorkspaces(response.workspaces);
      } catch (error) {
        toast.error('Failed to load workspaces');
      }
    };

    if (isOpen) {
      fetchWorkspaces();
    }
  }, [isOpen]);

  useEffect(() => {
    if (workspaceId) {
      setFormData(prev => ({
        ...prev,
        workspace_id: workspaceId
      }));
    }
  }, [workspaceId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Board title is required');
      return;
    }

    if (!formData.workspace_id) {
      toast.error('Please select a workspace');
      return;
    }

    setIsLoading(true);
    try {
      const response = await createBoard({
        ...formData,
        cover_img: selectedBg
      });
      toast.success('Board created successfully!');
      onBoardCreated(response.board);
      onClose();
      navigate(`/b/${response.board.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create board');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

      {/* Compact modal container */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Create New Board
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Background Selection - Compact Grid */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Background
              </label>
              
              {/* Responsive background grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg max-h-48 overflow-y-auto">
                {bgImageList.map((bg, index) => (
                  <div
                    key={index}
                    onClick={() => setSelectedBg(bg)}
                    className={`relative aspect-video rounded cursor-pointer overflow-hidden transition-all duration-200 hover:scale-105 ${
                      selectedBg === bg 
                        ? 'ring-2 ring-blue-500' 
                        : 'hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600'
                    }`}
                  >
                    <img
                      src={bg}
                      alt={`Background ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {selectedBg === bg && (
                      <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                        <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Fields - Compact Layout */}
            <div className="space-y-3">
              {/* Workspace Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Workspace *
                </label>
                <select
                  value={formData.workspace_id}
                  onChange={(e) => setFormData({ ...formData, workspace_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  required
                  disabled={!!workspaceId}
                >
                  <option value="">Select a workspace</option>
                  {workspaces.map((workspace) => (
                    <option key={workspace.id} value={workspace.id}>
                      {workspace.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Board Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Board Title *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="Enter board title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="2"
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                  placeholder="Add a more detailed description..."
                />
              </div>
            </div>
          </form>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating...' : 'Create Board'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateBoardModal;