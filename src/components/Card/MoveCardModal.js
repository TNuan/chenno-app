import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { FiX, FiLoader } from 'react-icons/fi';

const MoveCardModal = ({ isOpen, onClose, cardData, onMoveCard }) => {
  const [loading, setLoading] = useState(false);
  const [editableBoards, setEditableBoards] = useState([]);
  const [selectedBoardId, setSelectedBoardId] = useState(cardData?.board_id || null);
  const [columns, setColumns] = useState([]);
  const [selectedColumnId, setSelectedColumnId] = useState(null);
  const [position, setPosition] = useState('bottom');
  const [cardCount, setCardCount] = useState(0);

  // Fetch boards khi component mount
  useEffect(() => {
    if (isOpen) {
      fetchEditableBoards();
    }
  }, [isOpen]);

  // Fetch columns khi board được chọn
  useEffect(() => {
    if (selectedBoardId) {
      fetchColumns(selectedBoardId);
    } else {
      setColumns([]);
      setSelectedColumnId(null);
    }
  }, [selectedBoardId]);

  const fetchEditableBoards = async () => {
    setLoading(true);
    try {
      // Lấy tất cả boards mà user có quyền truy cập
      const response = await api.get('/boards/user/boards');
      
      // Gộp tất cả boards từ các workspaces vào một mảng duy nhất
      // và lọc để chỉ lấy các boards mà user có quyền chỉnh sửa (admin, owner hoặc member)
      const allBoards = [];
      
      response.data.listBoards.forEach(workspace => {
        const workspaceBoards = workspace.boards.filter(board => 
          ['admin', 'owner', 'member'].includes(board.role)
        );
        
        // Thêm workspace_name vào mỗi board để hiển thị
        workspaceBoards.forEach(board => {
          allBoards.push({
            ...board,
            workspace_name: workspace.name // Thêm tên workspace để hiển thị
          });
        });
      });
      
      setEditableBoards(allBoards);
      
      // Set board hiện tại là mặc định
      if (cardData?.board_id && !selectedBoardId) {
        setSelectedBoardId(cardData.board_id);
      } else if (allBoards.length > 0) {
        setSelectedBoardId(allBoards[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch editable boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchColumns = async (boardId) => {
    setLoading(true);
    try {
      const response = await api.get(`/columns/${boardId}`);
      setColumns(response.data.columns || []);
      
      // Nếu card đang ở trong board này, pre-select column hiện tại
      if (boardId === cardData?.board_id) {
        setSelectedColumnId(cardData.column_id);
        
        // Fetch số lượng card trong column này
        fetchCardCount(cardData.column_id);
      } else if (response.data.columns?.length > 0) {
        setSelectedColumnId(response.data.columns[0].id);
        
        // Fetch số lượng card trong column đầu tiên
        fetchCardCount(response.data.columns[0].id);
      } else {
        setSelectedColumnId(null);
        setCardCount(0);
      }
    } catch (error) {
      console.error('Failed to fetch columns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCardCount = async (columnId) => {
    try {
      const response = await api.get(`/cards/${columnId}`);
      setCardCount(response.data.cards?.length || 0);
    } catch (error) {
      console.error('Failed to fetch card count:', error);
      setCardCount(0);
    }
  };

  // Cập nhật card count khi column thay đổi
  useEffect(() => {
    if (selectedColumnId) {
      fetchCardCount(selectedColumnId);
    } else {
      setCardCount(0);
    }
  }, [selectedColumnId]);

  const handleMoveCard = async () => {
    if (!selectedColumnId) return;
    
    setLoading(true);
    try {
      // Tính toán position dựa trên lựa chọn
      let newPosition;
      if (position === 'top') {
        newPosition = 0;
      } else if (position === 'bottom') {
        newPosition = cardCount;
      } else {
        // Nếu là vị trí cụ thể, parse thành số
        newPosition = parseInt(position, 10);
      }
      
      // Gọi API để di chuyển card
      const response = await api.put(`/cards/${cardData.id}`, {
        column_id: selectedColumnId,
        position: newPosition
      });
      
      // Gọi callback với dữ liệu cập nhật
      onMoveCard(response.data.card, selectedBoardId !== cardData.board_id);
      
      // Đóng modal
      onClose();
    } catch (error) {
      console.error('Failed to move card:', error);
      alert('Failed to move card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Move Card</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>
        
        {loading && !editableBoards.length ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Select Board */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select destination board:
              </label>
              <select 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={selectedBoardId || ''}
                onChange={(e) => setSelectedBoardId(parseInt(e.target.value, 10))}
                disabled={loading || !editableBoards.length}
              >
                {editableBoards.length === 0 ? (
                  <option value="">No boards available</option>
                ) : (
                  editableBoards.map(board => (
                    <option key={board.id} value={board.id}>
                      {board.name} {board.workspace_name ? `(${board.workspace_name})` : ''} {board.id === cardData.board_id ? '(Current)' : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            {/* Select Column */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select destination column:
              </label>
              <select 
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                value={selectedColumnId || ''}
                onChange={(e) => setSelectedColumnId(parseInt(e.target.value, 10))}
                disabled={loading || !columns.length}
              >
                {columns.length === 0 ? (
                  <option value="">No columns available</option>
                ) : (
                  columns.map(column => (
                    <option key={column.id} value={column.id}>
                      {column.title} {column.id === cardData.column_id ? '(Current)' : ''}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            {/* Select Position */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Position:
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="position"
                    value="top"
                    checked={position === 'top'}
                    onChange={() => setPosition('top')}
                    className="mr-2"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Top of the column</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="position"
                    value="bottom"
                    checked={position === 'bottom'}
                    onChange={() => setPosition('bottom')}
                    className="mr-2"
                    disabled={loading}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Bottom of the column</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
                onClick={handleMoveCard}
                disabled={!selectedColumnId || loading}
              >
                {loading && <FiLoader className="animate-spin mr-1" />}
                {loading ? 'Moving...' : 'Move'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MoveCardModal;