import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Tạo instance socket
let socket;

export const initSocket = () => {
  const token = localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    console.error('No authentication token found');
    return null;
  }

  console.log('Initializing socket connection...');

  // Tạo kết nối socket với token xác thực
  socket = io(API_URL, {
    auth: {
      token
    },
    transports: ['websocket'],
    withCredentials: true
  });

  socket.on('connect', () => {
    console.log('Socket connected successfully:', socket.id);
    
    // Khi kết nối thành công, tham gia vào phòng của người dùng để nhận thông báo
    if (user && user.id) {
      // Tham gia vào phòng dựa trên user ID
      socket.emit('join_user_room', { userId: user.id });
      console.log('Joined user room:', `user:${user.id}`);
    }
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
  console.log('Attempting to join board:', boardId);
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit('join_board', { boardId });
    console.log('Join board request sent for board:', boardId);
  } else {
    console.error('Cannot join board: socket not connected');
  }
};

export const leaveBoard = (boardId) => {
  console.log('Leaving board:', boardId);
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit('leave_board', { boardId });
    console.log('Leave board request sent for board:', boardId);
  } else {
    console.error('Cannot leave board: socket not connected');
  }
};

export const emitBoardChange = (boardId, changeType, payload) => {
  console.log('Emitting board change:', { boardId, changeType });
  const socket = getSocket();
  if (socket && socket.connected) {
    socket.emit('board_change', { boardId, changeType, payload });
    console.log('Board change emitted successfully');
  } else {
    console.error('Cannot emit board change: socket not connected');
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected by client');
  }
};