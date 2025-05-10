import React from 'react'

// import BoardBar from 'components/BoardBar/BoardBar'
// import BoardContent from 'components/BoardContent/BoardContent'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useRef, useEffect, useState } from 'react'
import Header from '../components/Header/Header'
import BoardBar from '../components/Board/BoardBar'
import { getBoardById } from '../services/api'
import BoardContent from '../components/Board/BoardContent'

const Board = () => {
  const { boardId } = useParams();
  const [board, setBoard] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate()


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
  }, [boardId])

  const handleUpdateBoard = (updatedBoard) => {
    setBoard((prevBoard) => ({
      ...prevBoard,
      ...updatedBoard
    }));
  }

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
          <BoardBar board={board} onUpdate={handleUpdateBoard}/>
        </div>
        <div className="flex-1 mt-8 overflow-auto">
          <BoardContent board={board} />
        </div>
      </div>




    </div>
  )
}

export default Board