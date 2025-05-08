import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid,
  FiUsers,
  FiPieChart,
  FiSettings,
  FiChevronDown,
  FiFolder,
  FiCalendar
} from 'react-icons/fi';

const SidebarWorkspace = ({ workspaces = [], currentWorkspaceId, setRole, role }) => {
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const navigate = useNavigate();

  const handleWorkspaceChange = (workspaceId) => {
    setIsWorkspaceOpen(false);
    setRole(workspaces.find(w => w.id === workspaceId).role);
    navigate(`/w/${workspaceId}`);
  };

  // Convert currentWorkspaceId to number for comparison
  const currentWorkspaceIdNum = parseInt(currentWorkspaceId);
  const currentWorkspace = workspaces.find(w => w.id === currentWorkspaceIdNum);

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Workspace Selector */}
        <div className="relative">
          <button
            onClick={() => setIsWorkspaceOpen(!isWorkspaceOpen)}
            className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <FiFolder className="h-5 w-5" />
              <span className="truncate">
                {currentWorkspace?.name || 'Select Workspace'}
              </span>
            </div>
            <FiChevronDown className={`h-4 w-4 transition-transform ${isWorkspaceOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Workspace Dropdown */}
          {isWorkspaceOpen && (
            <div className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.id}
                  onClick={() => handleWorkspaceChange(workspace.id)}
                  className={`flex items-center w-full px-3 py-2 text-sm ${workspace.id === currentWorkspaceIdNum
                      ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                >
                  {workspace.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="space-y-1">
          {/* Boards */}
          <NavLink
            to={`/w/${currentWorkspaceId}/boards`}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${isActive
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <FiGrid className="mr-3 h-5 w-5" />
            Boards
          </NavLink>

          {/* Members */}
          <NavLink
            to={`/w/${currentWorkspaceId}/members`}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${isActive
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <FiUsers className="mr-3 h-5 w-5" />
            Members
          </NavLink>

          {/* Calendar */}
          <NavLink
            to={`/w/${currentWorkspaceId}/calendar`}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${isActive
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <FiCalendar className="mr-3 h-5 w-5" />
            Calendar
          </NavLink>

          {/* Analytics */}
          {(role === 'admin' || role === 'owner') && (
            <NavLink
              to={`/w/${currentWorkspaceId}/analytics`}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${isActive
                  ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <FiPieChart className="mr-3 h-5 w-5" />
              Analytics
            </NavLink>
          )}

          {/* Settings */}
          <NavLink
            to={`/workspace/${currentWorkspaceId}/settings`}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all ${isActive
                ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`
            }
          >
            <FiSettings className="mr-3 h-5 w-5" />
            Settings
          </NavLink>
        </nav>
      </div>
    </aside>
  );
};

export default SidebarWorkspace;