import React, { useState, useEffect } from 'react';
import { getBoards } from '../services/api';

const BoardsPage = () => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const data = await getBoards();
        setBoards(data.boards || []);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể lấy danh sách boards. Vui lòng kiểm tra backend.');
        setLoading(false);
      }
    };
    fetchBoards();
  }, []);

  if (loading) return <p className="p-6 text-center text-gray-600 dark:text-gray-400">Đang tải...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">All Boards</h1>
      {boards.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400">Không có board nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <div
              key={board.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-md shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                {board.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {board.description || 'Không có mô tả'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Workspace: {board.workspace_id}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardsPage;