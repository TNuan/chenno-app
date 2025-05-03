import React from 'react';
import WorkspaceList from '../components/Workspace/WorkspaceList';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen">
    <Header />
    <div className="flex flex-1 mx-auto w-full mt-16">
      <Sidebar className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto" />
      <main className="flex-1 ml-64 bg-gray-100 dark:bg-gray-800 min-h-[calc(100vh-4rem)]">
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
      </main>
    </div>
    </div>
  );
};

export default HomePage;