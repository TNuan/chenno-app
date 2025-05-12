import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Tạo instance socket
let socket;
let socketInitPromise = null;

export const initSocket = () => {
  // If we're already initializing, return the existing promise
  if (socketInitPromise) return socketInitPromise;
  
  const token = localStorage.getItem('accessToken');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    console.error('No authentication token found');
    return null;
  }

  console.log('Initializing socket connection...');

  // Create a promise that resolves when socket connects
  socketInitPromise = new Promise((resolve, reject) => {
    // Tạo kết nối socket với token xác thực
    socket = io(API_URL, {
      auth: {
        token
      },
      transports: ['websocket'],
      withCredentials: true
    });

    socket.on('connect', () => {
      console.log('Socket connected successfully 1:', socket.id);
      
      // Khi kết nối thành công, tham gia vào phòng của người dùng để nhận thông báo
      if (user && user.id) {
        // Tham gia vào phòng dựa trên user ID
        socket.emit('join_user_room', { userId: user.id });
        console.log('Joined user room:', `user:${user.id}`);
      }
      
      resolve(socket);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      reject(err);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      socketInitPromise = null; // Reset promise on disconnect
    });

    // Set a timeout in case connection takes too long
    setTimeout(() => {
      if (!socket.connected) {
        const error = new Error('Socket connection timeout');
        console.error(error);
        reject(error);
      }
    }, 10000);
  });

  return socketInitPromise;
};

// Thay đổi hàm getSocket()
export const getSocket = async () => {
  if (!socket) {
    try {
      return await initSocket();
    } catch (error) {
      console.error('Error getting socket:', error);
      return null;
    }
  }
  
  return socket; // Trả về socket đã được khởi tạo
};

export const joinBoard = async (boardId) => {
  console.log('Attempting to join board:', boardId);
  try {
    // Wait for socket to be connected
    const socketInstance = await getSocket();
    
    if (socketInstance && socketInstance.connected) {
      socketInstance.emit('join_board', { boardId });
      console.log('Join board request sent for board:', boardId);
      return true;
    } else {
      throw new Error('Socket not connected after waiting');
    }
  } catch (error) {
    console.error('Cannot join board:', error.message);
    return false;
  }
};

export const leaveBoard = async (boardId) => {
  console.log('Leaving board:', boardId);
  try {
    const socketInstance = await getSocket();
    
    if (socketInstance && socketInstance.connected) {
      socketInstance.emit('leave_board', { boardId });
      console.log('Leave board request sent for board:', boardId);
      return true;
    } else {
      throw new Error('Socket not connected');
    }
  } catch (error) {
    console.error('Cannot leave board:', error.message);
    return false;
  }
};

export const emitBoardChange = async (boardId, changeType, payload) => {
  console.log('Emitting board change:', { boardId, changeType });
  try {
    const socketInstance = await getSocket();
    
    if (socketInstance && socketInstance.connected) {
      socketInstance.emit('board_change', { boardId, changeType, payload });
      console.log('Board change emitted successfully');
      return true;
    } else {
      throw new Error('Socket not connected');
    }
  } catch (error) {
    console.error('Cannot emit board change:', error.message);
    return false;
  }
};

export const requestOnlineUsers = async (boardId) => {
  console.log('Requesting online users for board:', boardId);
  try {
    const socketInstance = await getSocket();
    
    if (socketInstance && socketInstance.connected) {
      socketInstance.emit('get_online_users', { boardId });
      console.log('Online users request sent for board:', boardId);
      return true;
    } else {
      throw new Error('Socket not connected');
    }
  } catch (error) {
    console.error('Cannot request online users:', error.message);
    return false;
  }
};

// Thay đổi hàm startOnlineUsersPolling để không thực sự poll
export const startOnlineUsersPolling = (boardId, intervalMs = 30000) => {
  // Không thực hiện polling nữa, chỉ trả về một giá trị để có thể hủy sau này nếu cần
  console.log('Online users polling disabled - using event-based updates instead');
  return true; // Trả về một giá trị không phải null để usersPollingRef.current có giá trị
};

export const stopOnlineUsersPolling = (intervalId) => {
  // Không cần làm gì vì chúng ta không thực sự tạo interval
  return;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    socketInitPromise = null;
    console.log('Socket disconnected by client');
  }
};