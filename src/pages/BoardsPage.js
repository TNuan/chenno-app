import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useRef, useEffect, useState } from 'react'
import Header from '../components/Header/Header'
import BoardBar from '../components/Board/BoardBar'
import { getBoardById } from '../services/api'
import BoardContent from '../components/Board/BoardContent'
import { getSocket, joinBoard, leaveBoard, initSocket } from '../services/socket'

const Board = () => {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const navigate = useNavigate();
  const socketRef = useRef(null);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const response = await getBoardById(boardId);
        setBoard(response.board);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching board:', err);
        setError('Failed to load board');
        setIsLoading(false);
      }
    };

    fetchBoard();
  }, [boardId]);

  // Setup socket connection
  useEffect(() => {
    if (!board) return;

    // Initialize socket
    const socket = getSocket();
    
    // Kiểm tra sự tồn tại của socket và cố gắng khởi tạo nếu không có
    if (!socket) {
      console.log('Socket not found, initializing new socket connection');
      const newSocket = initSocket();
      if (newSocket) {
        socketRef.current = newSocket;
        setupSocketListeners(newSocket);
      } else {
        console.error('Failed to initialize socket in BoardsPage');
      }
    } else {
      socketRef.current = socket;
      setupSocketListeners(socket);
    }

    // Hàm thiết lập các listener cho socket
    function setupSocketListeners(socket) {
      console.log('Setting up socket listeners for board:', boardId);
      
      // Tham gia board sau 500ms để đảm bảo kết nối đã ổn định
      setTimeout(() => {
        joinBoard(boardId);
      }, 500);
      
      // Listen for online users updates
      socket.on('online_users', (data) => {
        console.log('Online users received:', data);
        if (data.boardId === boardId) {
          setOnlineUsers(data.users);
        }
      });

      // Listen for board changes
      socket.on('board_updated', (data) => {
        console.log('Board update received:', data);
        if (data.boardId == boardId) {
          // Update board data based on change type
          if (data.changeType === 'column_order') {
            console.log('Updating column order:', data.payload);
            // Handle column reordering
            setBoard(prevBoard => ({
              ...prevBoard,
              columns: data.payload
            }));
          } else if (data.changeType === 'card_move') {
            // Handle card movement
            const { sourceColumnId, destinationColumnId, cards } = data.payload;
            setBoard(prevBoard => {
              const updatedColumns = prevBoard.columns.map(col => {
                if (col.id === sourceColumnId || col.id === destinationColumnId) {
                  return cards.find(c => c.id === col.id);
                }
                return col;
              });
              return { ...prevBoard, columns: updatedColumns };
            });
          } else if (data.changeType === 'column_update') {
            // Handle column update (title change, etc)
            setBoard(prevBoard => {
              const updatedColumns = prevBoard.columns.map(col => {
                if (col.id === data.payload.id) {
                  return data.payload;
                }
                return col;
              });
              return { ...prevBoard, columns: updatedColumns };
            });
          } else if (data.changeType === 'column_add') {
            // Handle new column
            setBoard(prevBoard => ({
              ...prevBoard,
              columns: [...prevBoard.columns, data.payload]
            }));
          } else if (data.changeType === 'board_update') {
            // Handle board updates (title, visibility, etc)
            setBoard(prevBoard => ({
              ...prevBoard,
              ...data.payload
            }));
          }
        }
      });

      // Gửi ping kiểm tra để đảm bảo kết nối hai chiều
      socket.emit('ping_board', { boardId, message: 'Checking connection' });
      socket.on('pong_board', (data) => {
        console.log('Received pong from server:', data);
      });
    }

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket listeners for board:', boardId);
      if (socketRef.current) {
        leaveBoard(boardId);
        socketRef.current.off('online_users');
        socketRef.current.off('board_updated');
        socketRef.current.off('pong_board');
      }
    };
  }, [boardId, board]);

  const handleUpdateBoard = (updatedBoard) => {
    setBoard((prevBoard) => ({
      ...prevBoard,
      ...updatedBoard
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 dark:text-red-400">{error}</div>
      </div>
    );
  }

  // Generate background style based on board.cover_img
  const backgroundStyle = board.cover_img
    ? {
      backgroundImage: `url(${board.cover_img})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }
    : { backgroundColor: '#f1f5f9' }; // Default light gray background if no image
  
  return (
    <div className="flex flex-col h-screen">
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header />
      </div>

      <div className="flex flex-col h-full pt-16"
        style={backgroundStyle}>
        <div className="fixed top-16 left-0 right-0 z-40">
          <BoardBar 
            board={board} 
            onUpdate={handleUpdateBoard} 
            onlineUsers={onlineUsers}
          />
        </div>
        <div className="flex-1 mt-8 overflow-auto">
          <BoardContent 
            board={board} 
            socketRef={socketRef.current}
          />
        </div>
      </div>
    </div>
  );
};

export default Board;