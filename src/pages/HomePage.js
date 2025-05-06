import React, { useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import WorkspaceList from '../components/Workspace/WorkspaceList';
import RecentlyBoards from '../components/Board/RecentlyBoards';
import BoardList from '../components/Board/BoardList';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import BoardListByWorkspace from '../components/Board/BoardListByWorkspace';
import CreateWorkspaceModal from '../components/Workspace/CreateWorkspaceModal';

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleWorkspaceCreated = (workspace) => {
    // Update your workspaces list or trigger a refresh
    // You might want to refetch the workspaces list here
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 mx-auto w-full mt-16">
        <Sidebar className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto" setIsModalOpen={setIsModalOpen} />
        <main className="flex-1 ml-64 bg-gray-100 dark:bg-gray-800 min-h-[calc(100vh-4rem)]">
          <div className="min-h-screen bg-gray-100 dark:bg-gray-800 p-6">
            <div className="max-w-7xl mx-auto">
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Home
                      </h1>
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <div className="grid gap-6">
                          <div className="space-y-6">
                            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                              Recently Viewed
                            </h2>
                            <RecentlyBoards />
                          </div>

                          <div className="space-y-4">
                            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                              Your Workspaces
                            </h2>
                            <BoardListByWorkspace />
                          </div>
                        </div>
                      </div>
                    </>
                  } 
                />
                <Route 
                  path="/favorites" 
                  element={
                    <>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Favorites
                      </h1>
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <div className="grid gap-6">
                          <div className="space-y-4">
                            <BoardList />
                          </div>
                        </div>
                      </div>
                    </>
                  } 
                />
                
              </Routes>
            </div>
          </div>
        </main>
      </div>
      <CreateWorkspaceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </div>
  );
};

export default HomePage;