import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import CreateWorkspaceModal from '../Workspace/CreateWorkspaceModal';
import { 
  FiHome, 
  FiStar, 
  FiGrid, 
  FiCalendar, 
  FiArchive, 
  FiUsers, 
  FiFolder,
  FiPlus,
  FiChevronDown,
  FiChevronRight,
  FiTrello,
  FiSettings
} from 'react-icons/fi';

const Sidebar = (props) => {
  const [expandedWorkspace, setExpandedWorkspace] = useState(null);
  const { setIsModalOpen, handleWorkspaceCreated, allBoardsUser, setIsCreateBoardModalOpen} = props;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Main Navigation */}
        <nav className="space-y-1">
          <NavLink
            to="/h"
            end
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <FiHome className="mr-3 h-5 w-5" />
            Home
          </NavLink>

          <NavLink
            to="/h/favorites"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <FiStar className="mr-3 h-5 w-5" />
            Favorites
          </NavLink>

          <NavLink
            to="/h/calendar"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <FiCalendar className="mr-3 h-5 w-5" />
            My Calendar
          </NavLink>
        </nav>

        {/* Workspaces */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Workspaces
            </h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="Thêm workspace"
            >
              <FiPlus size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-1">
            {allBoardsUser.map((workspace) => (
              <div key={workspace.id}>
                <button
                  onClick={() => setExpandedWorkspace(
                    expandedWorkspace === workspace.id ? null : workspace.id
                  )}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group"
                  title={workspace.name} // Hiển thị tên đầy đủ khi hover
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <FiFolder className="mr-3 h-5 w-5 flex-shrink-0" />
                    <span className="truncate">
                      {workspace.name}
                    </span>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    {expandedWorkspace === workspace.id ? (
                      <FiChevronDown className="h-4 w-4" />
                    ) : (
                      <FiChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </button>

                {expandedWorkspace === workspace.id && (
                  <div className="ml-9 mt-1 space-y-1">
                    <button
                      onClick={() => console.log('Navigate to boards')}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <FiTrello className="mr-3 h-4 w-4" />
                      Boards
                    </button>

                    <button
                      onClick={() => console.log('Navigate to members')}
                      className="flex items-center w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <FiUsers className="mr-3 h-4 w-4" />
                      Members
                      {(workspace.role === 'owner' || workspace.role === 'admin') && (
                        <div className="ml-auto text-xs text-gray-300 hover:text-gray-100 px-1 py-1 rounded-full">
                          <FiPlus className="h-4 w-4" />
                        </div>
                      )}
                    </button>

                    {workspace.role === 'owner' && (
                      <button
                        onClick={() => console.log('Navigate to settings')}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <FiSettings className="mr-3 h-4 w-4" />
                        Settings
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="px-3 mb-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Quick Actions
            </h3>
          </div>
          <div className="space-y-1">
            <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors" 
              onClick={() => setIsCreateBoardModalOpen(true)}
            >
              <FiPlus className="mr-3 h-5 w-5" />
              Tạo Board mới
            </button>
            <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors">
              <FiUsers className="mr-3 h-5 w-5" />
              Invite Team
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;