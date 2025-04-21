import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Địa chỉ API của bạn
  headers: {
    'Content-Type': 'application/json',
  },
});


// Thêm interceptor để tự động refresh token
api.interceptors.request.use(async (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    // Decode token để kiểm tra thời gian hết hạn
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();
    const timeUntilExpiry = expirationTime - currentTime;

    // Nếu token sắp hết hạn (ít hơn 5 phút)
    if (timeUntilExpiry < 300000) {
      try {
        const data = await refreshToken();
        localStorage.setItem('token', data.accessToken);
        config.headers.Authorization = `Bearer ${data.accessToken}`;
      } catch (error) {
        // Nếu refresh token thất bại, đăng xuất user
        localStorage.clear();
        window.location.href = '/login';
      }
    } else {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Interceptor xử lý lỗi response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API calls
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (username, email, password) => {
  const response = await api.post('/auth/register', { username, email, password });
  return response.data;
};

export const refreshToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  const response = await api.post('/auth/refresh-token', { refreshToken });
  return response.data;
};

export const getWorkspaces = async () => {
  const response = await api.get('/workspaces');
  return response.data;
};

export const getBoards = async () => {
  const response = await api.get('/boards');
  return response.data;
};

export default api;