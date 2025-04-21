import React from 'react';
import WorkspaceList from '../components/Workspace/WorkspaceList';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Dashboard
        </h1>
        
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
          <div className="grid gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                Your Workspaces
              </h2>
              <WorkspaceList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;