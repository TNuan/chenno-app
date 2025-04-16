import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="flex">
                  <Header />
                  <Sidebar />
                  <div className="flex-1 pt-16 md:pl-64">
                    <DashboardPage />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
          <Route path="/boards" element={<ProtectedRoute><div className="flex"><Header /><Sidebar /><div className="flex-1 pt-16 md:pl-64"><h1>Boards Page</h1></div></div></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute><div className="flex"><Header /><Sidebar /><div className="flex-1 pt-16 md:pl-64"><h1>Templates Page</h1></div></div></ProtectedRoute>} />
          <Route path="/workspaces" element={<ProtectedRoute><div className="flex"><Header /><Sidebar /><div className="flex-1 pt-16 md:pl-64"><h1>Workspaces Page</h1></div></div></ProtectedRoute>} />
          <Route path="/calendar" element={<ProtectedRoute><div className="flex"><Header /><Sidebar /><div className="flex-1 pt-16 md:pl-64"><h1>My Calendar Page</h1></div></div></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><div className="flex"><Header /><Sidebar /><div className="flex-1 pt-16 md:pl-64"><h1>Reports Page</h1></div></div></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><div className="flex"><Header /><Sidebar /><div className="flex-1 pt-16 md:pl-64"><h1>Settings Page</h1></div></div></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;