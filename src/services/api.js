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

export const updateRoleMember = async (workspaceId, memberId, data) => {
  const response = await api.put(`/workspaces/${workspaceId}/members/${memberId}`, data);
  return response.data;
}

export const removeMemberFromWorkspace = async (workspaceId, memberId) => {
  const response = await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
  return response.data;
}

// Api for Boards
export const getBoardById = async (boardId) => {
  const response = await api.get(`/boards/single/${boardId}`);
  return response.data;
}

export const updateBoard = async (boardId, data) => {
  const response = await api.put(`/boards/${boardId}`, data);
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

export const addMemberToBoard = async (boardId, data) => {
  const response = await api.post(`/boards/${boardId}/members`, data);
  return response.data;
};

export const updateBoardMemberRole = async (boardId, userId, data) => {
  const response = await api.put(`/boards/${boardId}/members/${userId}`, data);
  return response.data;
};

export const removeBoardMember = async (boardId, userId) => {
  const response = await api.delete(`/boards/${boardId}/members/${userId}`);
  return response.data;
};

// Api for Columns
export const getColumnsByBoard = async (boardId) => {
  const response = await api.get(`/columns/${boardId}`);
  return response.data;
}

export const createColumn = async (data) => {
  const response = await api.post(`/columns`, data);
  return response.data;
}

export const updateColumn = async (columnId, data) => {
  const response = await api.put(`/columns/${columnId}`, data);
  return response.data;
}

export const deleteColumn = async (columnId) => {
  const response = await api.delete(`/columns/${columnId}`);
  return response.data;
}

// Api for Cards
export const createCard = async (data) => {
  const response = await api.post('/cards', data);
  return response.data;
}

export const getCardsByColumn = async (columnId) => {
  const response = await api.get(`/cards/${columnId}`);
  return response.data;
}

export const updateCard = async (cardId, data) => {
  const response = await api.put(`/cards/${cardId}`, data);
  return response.data;
}

export const copyCard = async (cardId, data) => {
  const response = await api.post(`/cards/copy/${cardId}`, data);
  return response.data;
}

export const archiveCard = async (cardId) => {
  const response = await api.patch(`/cards/${cardId}/archive`);
  return response.data;
};

export const unarchiveCard = async (cardId) => {
  const response = await api.patch(`/cards/${cardId}/unarchive`);
  return response.data;
};

export const watchCard = async (cardId) => {
  const response = await api.patch(`/cards/${cardId}/watch`);
  return response.data;
};

export const unwatchCard = async (cardId) => {
  const response = await api.patch(`/cards/${cardId}/unwatch`);
  return response.data;
};

// Api for Comments
export const getCommentsByCard = async (cardId) => {
  const response = await api.get(`/comments/card/${cardId}`);
  return response.data;
}

export const createComment = async (data) => {
  const response = await api.post('/comments', data);
  return response.data;
}

export const updateComment = async (commentId, data) => {
  const response = await api.put(`/comments/${commentId}`, data);
  return response.data;
}

export const deleteComment = async (commentId) => {
  const response = await api.delete(`/comments/${commentId}`);
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

// Attachment API
export const uploadAttachment = async (cardId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('card_id', cardId);
  
  const response = await api.post('/attachments', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getCardAttachments = async (cardId) => {
  const response = await api.get(`/attachments/card/${cardId}`);
  return response.data;
};

export const deleteAttachment = async (attachmentId) => {
  const response = await api.delete(`/attachments/${attachmentId}`);
  return response.data;
};

export const downloadAttachment = async (attachmentId, fileName) => {
  try {
    // Sử dụng API instance với responseType là blob
    const response = await api.get(`/attachments/download/${attachmentId}`, {
      responseType: 'blob' // Quan trọng để xử lý dữ liệu nhị phân
    });
    
    // Tạo URL từ blob data
    const url = window.URL.createObjectURL(new Blob([response.data]));
    
    // Tạo link và kích hoạt download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return response;
  } catch (error) {
    console.error('Error downloading attachment:', error);
    throw error;
  }
};

export const getUserCards = async () => {
    const response = await api.get('/cards/my-cards');
    return response.data;
};

export default api;