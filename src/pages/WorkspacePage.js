import React, { useState, useEffect } from 'react';
import { Route, Routes, useParams } from 'react-router-dom';
import { getWorkspaces } from '../services/api';
import Header from '../components/Header/Header';
import SidebarWorkspace from '../components/Sidebar/SidebarWorkspace';
import BoardsByWorkspace from '../components/Board/BoardsByWorkspace';
import MemberList from '../components/Workspace/MemberList';

const WorkspacePage = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { workspaceId } = useParams();
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [role, setRole] = useState('');

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const response = await getWorkspaces();
        setWorkspaces(response.workspaces);
        const current = response.workspaces.find(w => w.id === parseInt(workspaceId));
        if (current) {
          setCurrentWorkspace(current);
          setRole(current.role);
        } else {
          setError('Workspace not found');
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching workspaces:', err);
        setError('Failed to load workspaces');
        setIsLoading(false);
      }
    };

    fetchWorkspaces();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }
    
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 mx-auto w-full mt-16">
        <SidebarWorkspace 
          workspaces={workspaces}
          currentWorkspaceId={workspaceId}
          setRole={setRole}
          role={role} 
          className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto" 
        />
        <main className="flex-1 ml-64 bg-gray-100 dark:bg-gray-800 min-h-[calc(100vh-4rem)]">
          <div className="min-h-screen bg-gray-100 dark:bg-gray-800 p-6">
            <div className="max-w-8xl mx-auto">
              <Routes>
                <Route 
                  path="" 
                  element={
                    <>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        {workspaces.find(w => w.id === parseInt(workspaceId))?.name || 'Workspace'}
                      </h1>
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <div className="grid gap-6">
                          <div className="space-y-6">
                            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                Workspace Boards
                            </h2>
                            <BoardsByWorkspace workspaceId={workspaceId} />
                          </div>
                        </div>
                      </div>
                    </>
                  } 
                />
                <Route 
                  path="/boards" 
                  element={
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                      <div className="grid gap-6">
                        <div className="space-y-6">
                        <div className="space-y-4">
                          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                              Workspace Boards
                          </h2>
                          <BoardsByWorkspace workspaceId={workspaceId} />
                          </div>
                        </div>
                      </div>
                    </div>
                  } 
                />
                <Route 
                  path="/members" 
                  element={
                    <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                      <div className="grid gap-6">
                        <div className="space-y-6">
                        <div className="space-y-4">
                          
                          <MemberList workspaceId={workspaceId} role={role}/>
                          </div>
                        </div>
                      </div>
                    </div>
                  } 
                />
                <Route 
                  path="/members" 
                  element={
                    <>
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                        Boards
                      </h1>
                      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6">
                        <div className="grid gap-6">
                          <div className="space-y-6">
                          <div className="space-y-4">
                            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                                Workspace Boards
                            </h2>
                            <BoardsByWorkspace workspaceId={workspaceId} />
                            </div>
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
    </div>
  );
};

export default WorkspacePage;