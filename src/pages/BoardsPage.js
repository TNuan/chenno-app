import React from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useRef, useEffect, useState } from 'react'
import Header from '../components/Header/Header'
import BoardBar from '../components/Board/BoardBar'
import { getBoardById } from '../services/api'
import BoardContent from '../components/Board/BoardContent'
import {
  getSocket,
  joinBoard,
  leaveBoard,
  requestOnlineUsers,
} from '../services/socket'
import { useAlert } from '../contexts/AlertContext';

const Board = () => {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const usersPollingRef = useRef(null);
  const { showAccessDenied } = useAlert();

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

  // Setup socket connection - Cải thiện để tránh request nhiều lần
  useEffect(() => {
    let isMounted = true;

    const initializeSocket = async () => {
        try {
            const socket = await getSocket();
            if (!isMounted) return;

            socketRef.current = socket;
            setupSocketListeners(socket);
        } catch (error) {
            console.error('Failed to initialize socket:', error);
        }
    };

    function setupSocketListeners(socket) {
        console.log('Setting up socket listeners for board:', boardId);

        // Clear existing listeners
        socket.off('online_users');
        socket.off('user_joined');
        socket.off('user_left');
        socket.off('board_updated');
        socket.off('pong_board');

        // Join board and request online users
        if (socket.connected) {
            console.log('Socket already connected, joining board immediately');
            (async () => {
                await joinBoard(boardId);
                await requestOnlineUsers(boardId);
                if (isMounted && !usersPollingRef.current) {
                    usersPollingRef.current = true;
                }
            })();
        } else {
            const connectHandler = async () => {
                console.log('Socket connected, now joining board');
                socket.off('connect', connectHandler);
                await joinBoard(boardId);
                await requestOnlineUsers(boardId);
                if (isMounted && !usersPollingRef.current) {
                    usersPollingRef.current = true;
                }
            };
            socket.on('connect', connectHandler);
        }

        // Online users management
        socket.on('online_users', (data) => {
            console.log('Online users received:', data);
            if (data.boardId === boardId && isMounted) {
                setOnlineUsers(data.users || []);
            }
        });

        socket.on('user_joined', (data) => {
            console.log('User joined:', data);
            if (data.boardId === boardId && data.user) {
                requestOnlineUsers(boardId);
            }
        });

        socket.on('user_left', (data) => {
            console.log('User left:', data);
            if (data.boardId === boardId && data.userId) {
                requestOnlineUsers(boardId);
            }
        });

        // Board-level updates only
        socket.on('board_updated', (data) => {
            console.log('BoardsPage received board update:', data);
            
            if (data.boardId != boardId || !isMounted) return;

            switch (data.changeType) {
                case 'board_update':
                    console.log('Updating board info:', data.payload);
                    setBoard(prevBoard => {
                        const updatedBoard = {
                            ...prevBoard,
                            ...data.payload
                        };

                        // Check for privacy changes
                        if (
                            data.payload.visibility === 0 &&
                            (!updatedBoard.user_role || updatedBoard.user_role === '')
                        ) {
                            showAccessDenied(
                                'Bảng này đã được chuyển sang chế độ riêng tư và bạn không còn quyền truy cập.',
                                () => navigate('/')
                            );
                        }

                        return updatedBoard;
                    });
                    break;

                case 'add_member':
                    console.log('New member added:', data.payload);
                    setBoard(prevBoard => {
                        const updatedBoard = {
                            ...prevBoard,
                            members: [...prevBoard.members, data.payload]
                        };

                        if (data.payload.user_id == updatedBoard.user_getting) {
                            showAccessDenied(
                                'Bạn được thay đổi quyền đối với bảng này. Reload lại ngay bây giờ.',
                                () => window.location.reload()
                            );
                        }
                        return updatedBoard;
                    });
                    break;

                case 'remove_member':
                    console.log('Member removed:', data.payload);
                    setBoard(prevBoard => {
                        const updatedMembers = prevBoard.members.filter(
                            member => member.id !== data.payload.user_id
                        );
                        const updatedBoard = { ...prevBoard, members: updatedMembers };
                        
                        if (data.payload.user_id == updatedBoard.user_getting) {
                            showAccessDenied(
                                'Bạn được thay đổi quyền đối với bảng này. Reload lại ngay bây giờ.',
                                () => window.location.reload()
                            );
                        }
                        return updatedBoard;
                    });
                    break;

                default:
                    // Let BoardContent handle column/card events
                    break;
            }
        });

        // Connection check
        socket.emit('ping_board', { boardId, message: 'Checking connection' });
        socket.on('pong_board', (data) => {
            console.log('Received pong from server:', data);
        });
    }

    initializeSocket();

    return () => {
        isMounted = false;
        console.log('Cleaning up socket listeners for board:', boardId);
        if (socketRef.current) {
            leaveBoard(boardId);
            socketRef.current.off('online_users');
            socketRef.current.off('user_joined');
            socketRef.current.off('user_left');
            socketRef.current.off('board_updated');
            socketRef.current.off('pong_board');
        }
        usersPollingRef.current = null;
    };
}, [boardId]); // Chỉ phụ thuộc vào boardId

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

      <div className="flex flex-col h-full mt-16"
        style={backgroundStyle}>
        <div className="fixed top-16 left-0 right-0 z-40">
          <BoardBar
            board={board}
            onUpdate={handleUpdateBoard}
            onlineUsers={onlineUsers}
          />
        </div>
        <div className="flex-1 mt-12">
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