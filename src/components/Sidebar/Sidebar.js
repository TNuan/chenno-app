import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
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
  FiChevronRight
} from 'react-icons/fi';

const Sidebar = () => {
  const [expandedWorkspace, setExpandedWorkspace] = useState(null);

  const workspaces = [
    { id: 1, name: 'Personal', boards: ['Tasks', 'Notes', 'Ideas'] },
    { id: 2, name: 'Work', boards: ['Projects', 'Meetings', 'Goals'] },
  ];

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Main Navigation */}
        <nav className="space-y-1">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <FiHome className="mr-3 h-5 w-5" />
            Dashboard
          </NavLink>

          <NavLink
            to="/favorites"
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <FiStar className="mr-3 h-5 w-5" />
            Yêu thích
          </NavLink>
        </nav>

        {/* Workspaces */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Workspaces
            </h3>
            <button 
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="Thêm workspace"
            >
              <FiPlus size={16} className="text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-1">
            {workspaces.map((workspace) => (
              <div key={workspace.id}>
                <button
                  onClick={() => setExpandedWorkspace(
                    expandedWorkspace === workspace.id ? null : workspace.id
                  )}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="flex items-center">
                    <FiFolder className="mr-3 h-5 w-5" />
                    {workspace.name}
                  </div>
                  {expandedWorkspace === workspace.id ? (
                    <FiChevronDown className="h-4 w-4" />
                  ) : (
                    <FiChevronRight className="h-4 w-4" />
                  )}
                </button>

                {expandedWorkspace === workspace.id && (
                  <div className="ml-9 mt-1 space-y-1">
                    {workspace.boards.map((board) => (
                      <button
                        key={board}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                      >
                        <FiGrid className="mr-3 h-4 w-4" />
                        {board}
                      </button>
                    ))}
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
            <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/50 rounded-lg transition-colors">
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