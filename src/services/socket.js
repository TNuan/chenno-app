import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Tạo instance socket
let socket;

export const initSocket = () => {
  const token = localStorage.getItem('accessToken');
  
  if (!token) {
    console.error('No authentication token found');
    return null;
  }

  // Tạo kết nối socket với token xác thực
  socket = io(API_URL, {
    auth: {
      token
    },
    transports: ['websocket'],
    withCredentials: true
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const joinBoard = (boardId) => {
  console.log('Joining board:', boardId);
  const socket = getSocket();
  if (socket) {
    socket.emit('join_board', { boardId });
  }
};

export const leaveBoard = (boardId) => {
  const socket = getSocket();
  if (socket) {
    socket.emit('leave_board', { boardId });
  }
};

export const emitBoardChange = (boardId, changeType, payload) => {
    console.log('Emitting board change:', { boardId, changeType, payload });
  const socket = getSocket();
  if (socket) {
    socket.emit('board_change', { boardId, changeType, payload });
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};