import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { createBoard, getWorkspaces } from '../../services/api';
import { Navigate } from 'react-router-dom';

// Import background images
const backgroundImages = require.context('../../assets/images/bg-boards', false, /\.(png|jpe?g|svg)$/);
const bgImageList = backgroundImages.keys().map(backgroundImages);

const CreateBoardModal = ({ isOpen, onClose, onBoardCreated, workspaceId }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    workspace_id: workspaceId || '', // Initialize with prop value
    cover_img: bgImageList[0] // Default to first background
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

  // Update workspace when prop changes
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
      Navigate(`/b/${response.board.id}`); // Redirect to the new board page
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create board');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl dark:bg-gray-900 sm:my-8 sm:align-middle sm:p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            <FiX className="w-6 h-6" />
          </button>

          <div className="sm:flex sm:items-start">
            <div className="w-full">
              <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">
                Create New Board
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Background Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Background
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {bgImageList.map((bg, index) => (
                      <div
                        key={index}
                        onClick={() => setSelectedBg(bg)}
                        className={`relative aspect-video rounded-lg cursor-pointer overflow-hidden ${
                          selectedBg === bg ? 'ring-2 ring-blue-500' : ''
                        }`}
                      >
                        <img
                          src={bg}
                          alt={`Background ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workspace Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Workspace *
                  </label>
                  <select
                    value={formData.workspace_id} // This is controlled by state
                    onChange={(e) => setFormData({ ...formData, workspace_id: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    required
                    disabled={!!workspaceId}
                  >
                    <option value="">Select a workspace</option>
                    {workspaces.map((workspace) => (
                      <option 
                        key={workspace.id} 
                        value={workspace.id}
                      >
                        {workspace.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Board Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Board Title *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="p-3 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder="Enter board title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="p-3 mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    placeholder="Add a more detailed description..."
                  />
                </div>

                {/* Submit Button */}
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create Board'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateBoardModal;