import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true, // Gửi cookie (refresh token) trong request
});

// Interceptor cho request: gắn accessToken nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

// Interceptor xử lý 401 và tự động gọi refresh token
api.interceptors.response.use(
  (response) => response,
  async (err) => {
    const originalRequest = err.config;

    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const res = await api.post('/auth/refresh-token');
        const newToken = res.data.accessToken;

        // Lưu access token mới
        localStorage.setItem('accessToken', newToken);

        // Gắn lại access token vào request cũ
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        // Gửi lại request cũ
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token không còn hiệu lực
        alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(err);
  }
);

export const login = async (data) => {
  const response = await api.post('/users/login', data);
  return response.data;
};

export const register = async (data) => {
  const response = await api.post('/users/register', data);
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.post('/users/verify-email', { token });
  return response.data;
};

export const logout = async (data) => {
  const response = await api.post('/users/logout', data);
  return response.data;
};

export const searchUser = async (key) => {
  const response = await api.get(`/users/search?key=${key}`);
  return response.data;
}

export const getWorkspaces = async () => {
  const response = await api.get('/workspaces');
  return response.data;
};

export const getMembersByWorkspace = async (workspaceId) => {
  const response = await api.get(`/workspaces/${workspaceId}/members`);
  return response.data;
}

export const createWorkspace = async (data) => {
  const response = await api.post('/workspaces', data);
  return response.data;
};

export const addMemberToWorkspace = async (workspaceId, data) => {
  const response = await api.post(`/workspaces/${workspaceId}/members`, data);
  return response.data;
}

export const bulkInviteToWorkspace = async (workspaceId, data) => {
  const response = await api.post(`/workspaces/${workspaceId}/bulk-invite`, data);
  return response.data;
}

export const getBoardsByWorkspace = async (workspaceId) => {
  const response = await api.get(`/boards/${workspaceId}`);
  return response.data;
};

export const getBoards = async () => {
  const response = await api.get('/boards');
  return response.data;
};

export const createBoard = async (data) => {
  const response = await api.post('/boards', data);
  return response.data;
}

export const getRecentlyBoards = async () => {
  const response = await api.get('/boards/user/recent-boards');
  return response.data;
};

export const getFavoriteBoards = async () => {
  const response = await api.get('/boards/user/favorite-boards');
  return response.data;
}

export const toggleFavoriteBoard = async (boardId) => {
  const response = await api.patch(`/boards/user/favorite-boards/${boardId}`);
  return response.data;
}

export const getAllBoards = async () => {
  const response = await api.get('/boards/user/boards');
  return response.data;
}

// Notification API
export const getNotifications = async () => {
  const response = await api.get('/notifications');
  return response.data;
}

export const markNotificationAsRead = async (notificationId) => {
  const response = await api.patch(`/notifications/${notificationId}/read`);
  return response.data;
}

export const markAllNotificationsAsRead = async () => {
  const response = await api.post('/notifications/read-all');
  return response.data;
}

export default api;