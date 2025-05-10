import React, { useState, useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import RecentlyBoards from '../components/Board/RecentlyBoards';
import BoardList from '../components/Board/BoardList';
import Header from '../components/Header/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import AllBoardsUser from '../components/Board/AllBoardsUser';
import CreateWorkspaceModal from '../components/Workspace/CreateWorkspaceModal';
import CreateBoardModal from '../components/Board/CreateBoardModal';
import { getWorkspaces, getAllBoards } from '../services/api';
import FavoriteBoards from '../components/Board/FavoriteBoards';

const HomePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [allBoardsUser, setAllBoardsUser] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const handleWorkspaceCreated = (newWorkspace) => {
    const newAllBoardsUser = [...allBoardsUser, {...newWorkspace, boards: [], role: 'owner'}];
    setAllBoardsUser(newAllBoardsUser)
  };

  const handleBoardCreated = (board) => {
    setAllBoardsUser(prevWorkspaces =>
      prevWorkspaces.map(workspace => {
        if (workspace.id === board.workspace_id) {
          return {
            ...workspace,
            boards: [...workspace.boards, board]
          };
        }
        return workspace;
      })
    );
  };

  const handleBoardUpdate = (updatedBoard) => {
    setAllBoardsUser(prevWorkspaces =>
      prevWorkspaces.map(workspace => ({
        ...workspace,
        boards: workspace.boards.map(board =>
          board.id === updatedBoard.id ? updatedBoard : board
        )
      }))
    );
  };

  useEffect(() => {
    const fetchAllBoardsUser = async () => {
      try {
        const response = await getAllBoards();
        setAllBoardsUser(response.listBoards);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching workspaces:', err);
        setIsLoading(false);
      }
    };

    fetchAllBoardsUser();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="flex flex-1 mx-auto w-full mt-16">
        <Sidebar className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto" 
          setIsModalOpen={setIsModalOpen} 
          allBoardsUser={allBoardsUser} 
          setIsCreateBoardModalOpen={setIsCreateBoardModalOpen}
        />
        <main className="flex-1 ml-64 bg-gray-100 dark:bg-gray-800 min-h-[calc(100vh-4rem)]">
          <div className="min-h-screen bg-gray-100 dark:bg-gray-800 p-6">
            <div className="max-w-8xl mx-auto">
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
                                Favorites Boards
                              </h2>
                            <FavoriteBoards allBoardsUser={allBoardsUser} handleBoardUpdate={handleBoardUpdate}/>
                          </div>

                          <div className="space-y-6">
                            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                              Recently Viewed
                            </h2>
                            <RecentlyBoards allBoardsUser={allBoardsUser} handleBoardUpdate={handleBoardUpdate}/>
                          </div>

                          <div className="space-y-4">
                            <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                              Your Workspaces
                            </h2>
                            <AllBoardsUser allBoardsUser={allBoardsUser} handleBoardUpdate={handleBoardUpdate}/>
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
                            <FavoriteBoards />
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
      <CreateBoardModal
        isOpen={isCreateBoardModalOpen}
        onClose={() => setIsCreateBoardModalOpen(false)}
        onBoardCreated={handleBoardCreated}
        workspaceId={null} // Pass the workspace ID if needed
      />
    </div>
  );
};

export default HomePage;