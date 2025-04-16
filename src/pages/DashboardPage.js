import React from 'react';
import WorkspaceList from '../components/Workspace/WorkspaceList';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <WorkspaceList />
    </div>
  );
};

export default DashboardPage;