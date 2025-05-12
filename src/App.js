import React, { useContext, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import BoardsPage from './pages/BoardsPage';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import DashboardPage from './pages/DashboardPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import HomePage from './pages/HomePage';
import WorkspacePage from './pages/WorkspacePage';
import { initSocket, disconnectSocket } from './services/socket';

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

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('accessToken');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const theme = localStorage.getItem('theme')

  // Initialize socket connection when app starts
  useEffect(() => {
    const initializeSocket = async () => {
      if (localStorage.getItem('accessToken')) {
        try {
          await initSocket();
          console.log('Socket initialized successfully in App.js');
        } catch (error) {
          console.error('Failed to initialize socket in App.js:', error);
        }
      }
    };
    
    initializeSocket();
    
    // Cleanup on app unmount
    return () => {
      disconnectSocket();
    };
  }, []);

  return (
    <ThemeProvider>
      <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 dark:text-white">
        <BrowserRouter>
          <Routes>
            {/* Root Redirect */}
            <Route path="/" element={<Navigate to="/h" replace />} />

            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            
            {/* Protected Routes */}
            <Route path="/h/*" element={<PrivateRoute><HomePage/></PrivateRoute>} />
            <Route path="/w/:workspaceId/*" element={<PrivateRoute><WorkspacePage/></PrivateRoute>} />
            <Route path="/b/:boardId/*" element={<PrivateRoute><BoardsPage/></PrivateRoute>} />

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
        </BrowserRouter>
        
        {/* Toast container với theme đúng */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={theme === 'dark' ? 'dark' : 'light'}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;