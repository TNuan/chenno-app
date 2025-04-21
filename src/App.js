import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BoardsPage from './pages/BoardsPage';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import { ThemeProvider } from './context/ThemeContext';
import DashboardPage from './pages/DashboardPage';

// Layout cho các trang được bảo vệ
const DashboardLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Header />
    <div className="flex flex-1 mx-auto w-full mt-16">
      <Sidebar className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 overflow-y-auto" />
      <main className="flex-1 ml-64 bg-gray-100 dark:bg-gray-800 min-h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  </div>
);

// Route được bảo vệ
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// Route công khai
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" /> : children;
};

// Cấu hình routes
const routes = [
  {
    path: '/dashboard',
    component: <DashboardPage />
  },
  {
    path: '/boards',
    component: <BoardsPage />
  },
  {
    path: '/templates',
    component: <h1 className="p-6 text-2xl font-semibold">Templates Page</h1>
  },
  {
    path: '/workspaces',
    component: <h1 className="p-6 text-2xl font-semibold">Workspaces Page</h1>
  },
  {
    path: '/calendar',
    component: <h1 className="p-6 text-2xl font-semibold">My Calendar Page</h1>
  },
  {
    path: '/reports',
    component: <h1 className="p-6 text-2xl font-semibold">Reports Page</h1>
  },
  {
    path: '/settings',
    component: <h1 className="p-6 text-2xl font-semibold">Settings Page</h1>
  }
];

function App() {
  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 dark:text-white">
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                  <LoginPage />
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            {routes.map(({ path, component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      {component}
                    </DashboardLayout>
                  </ProtectedRoute>
                }
              />
            ))}

            {/* Default Routes */}
            <Route path="/" element={<Navigate to="/dashboard" />} />
            
            {/* 404 Route */}
            <Route
              path="*"
              element={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
                      404
                    </h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Trang không tồn tại
                    </p>
                    <button
                      onClick={() => window.history.back()}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Quay lại
                    </button>
                  </div>
                </div>
              }
            />
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  );
}

export default App;