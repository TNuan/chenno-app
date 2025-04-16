import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiTrello, FiGrid, FiFolder, FiCalendar, FiBarChart2, FiSettings } from 'react-icons/fi';

const Sidebar = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true); // Trạng thái mở/đóng sidebar trên mobile

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`fixed top-16 left-0 h-[calc(100vh-4rem)] bg-gray-800 text-white transition-all duration-300 ${
        isOpen ? 'w-64' : 'w-16'
      } z-40 md:w-64 md:top-16`}
    >
      <div className="flex flex-col h-full">
        {/* Toggle button (mobile) */}
        <button
          className="md:hidden p-4 text-white hover:bg-gray-700"
          onClick={toggleSidebar}
        >
          {isOpen ? '✕' : '☰'}
        </button>

        {/* Menu items */}
        <div className={`flex-1 overflow-y-auto ${isOpen ? 'block' : 'hidden md:block'}`}>
          <nav className="p-4">
            <ul className="space-y-2">
              {/* Boards */}
              <li>
                <button
                  onClick={() => navigate('/boards')}
                  className="flex items-center w-full p-2 rounded-lg hover:bg-gray-700"
                >
                  <FiTrello className="mr-3" size={20} />
                  {isOpen && <span>Boards</span>}
                </button>
              </li>

              {/* Templates */}
              <li>
                <button
                  onClick={() => navigate('/templates')}
                  className="flex items-center w-full p-2 rounded-lg hover:bg-gray-700"
                >
                  <FiGrid className="mr-3" size={20} />
                  {isOpen && <span>Templates</span>}
                </button>
              </li>

              {/* Workspace */}
              <li>
                <button
                  onClick={() => navigate('/workspaces')}
                  className="flex items-center w-full p-2 rounded-lg hover:bg-gray-700"
                >
                  <FiFolder className="mr-3" size={20} />
                  {isOpen && <span>Workspace</span>}
                </button>
              </li>

              {/* My Calendar */}
              <li>
                <button
                  onClick={() => navigate('/calendar')}
                  className="flex items-center w-full p-2 rounded-lg hover:bg-gray-700"
                >
                  <FiCalendar className="mr-3" size={20} />
                  {isOpen && <span>My Calendar</span>}
                </button>
              </li>

              {/* Reports */}
              <li>
                <button
                  onClick={() => navigate('/reports')}
                  className="flex items-center w-full p-2 rounded-lg hover:bg-gray-700"
                >
                  <FiBarChart2 className="mr-3" size={20} />
                  {isOpen && <span>Reports</span>}
                </button>
              </li>

              {/* Settings */}
              <li>
                <button
                  onClick={() => navigate('/settings')}
                  className="flex items-center w-full p-2 rounded-lg hover:bg-gray-700"
                >
                  <FiSettings className="mr-3" size={20} />
                  {isOpen && <span>Settings</span>}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;