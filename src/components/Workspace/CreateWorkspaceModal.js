import React, { useState } from 'react';
import { createWorkspace } from '../../services/api';
import { toast } from 'react-toastify';
import { FiX, FiUsers } from 'react-icons/fi';
import workspaceIllustration from '../../assets/images/workspace-illustration.avif';
import { Navigate } from 'react-router-dom';

const CreateWorkspaceModal = ({ isOpen, onClose, onWorkspaceCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    members: []
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Workspace name is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await createWorkspace(formData);
      toast.success('Workspace created successfully!');
      onWorkspaceCreated(response.workspace);
      Navigate(`/w/${response.workspace.id}`); // Redirect to the new workspace page
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create workspace');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-16 sm:align-middle sm:max-w-4xl sm:w-full relative">
          {/* Close button - Moved here */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-gray-100 dark:hover:text-gray-300 transition-colors"
          >
            <FiX className="h-6 w-6" />
          </button>

          <div className="flex">
            {/* Form Section */}
            <div className="flex-1 px-6 pt-6 pb-6 sm:p-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Create Workspace
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Workspace Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Workspace Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white sm:text-sm p-3"
                    placeholder="Enter workspace name"
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
                    rows="6"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white sm:text-sm p-3"
                    placeholder="Describe your workspace"
                  />
                </div>

                {/* Members Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Members (Optional)
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <div className="relative flex items-stretch flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FiUsers className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        className="block w-full rounded-md border-gray-300 pl-10 focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white sm:text-sm p-3"
                        placeholder="Add members by email"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="mt-5 sm:mt-6">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isLoading ? 'Creating...' : 'Create Workspace'}
                  </button>
                </div>
              </form>
            </div>

            {/* Illustration Section */}
            <div className="hidden sm:block w-2/5 bg-gray-50 dark:bg-gray-800">
              <img
                src={workspaceIllustration}
                alt="Workspace illustration"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;