import { useState, useEffect } from 'react';
import { verifyToken, refreshToken } from '../services/api';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const refreshTokenValue = localStorage.getItem('refreshToken');
        const user = localStorage.getItem('user');
        if (!token || !refreshTokenValue || !user) {
          setIsAuthenticated(false);
          return;
        }

        // Decode token để kiểm tra thời gian
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeUntilExpiry = expirationTime - currentTime;

        // Nếu token sắp hết hạn
        if (timeUntilExpiry < 300000) {
          const data = await refreshToken();
          localStorage.setItem('token', data.accessToken);
        }

        setIsAuthenticated(true);
      } catch (error) {
        localStorage.clear();
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Set up interval để kiểm tra token mỗi phút
    // const interval = setInterval(checkAuth, 60000);

    // return () => clearInterval(interval);
  }, []);

  return { isAuthenticated, isLoading };
};