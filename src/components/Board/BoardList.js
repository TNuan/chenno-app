import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const BoardList = ({ workspaceId }) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await api.get(`/boards/${workspaceId}`);
        setBoards(response.data.boards);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Lỗi khi lấy danh sách boards');
        setLoading(false);
      }
    };
    fetchBoards();
  }, [workspaceId]);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/boards', { workspace_id: parseInt(workspaceId), name, description });
      setBoards([...boards, response.data.board]);
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi tạo board');
    }
  };

  if (loading) return <p className="text-center mt-10">Đang tải...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Danh sách Boards</h2>
      <form onSubmit={handleCreateBoard} className="mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tên board"
            className="p-2 border rounded flex-1"
            required
          />
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Mô tả (tùy chọn)"
            className="p-2 border rounded flex-1"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Tạo Board
          </button>
        </div>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.map((board) => (
          <div
            key={board.id}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition"
          >
            <h3 className="text-xl font-semibold">{board.name}</h3>
            <p className="text-gray-600">{board.description || 'Không có mô tả'}</p>
            <p className="text-sm text-gray-500 mt-2">
              Tạo bởi: {board.created_by}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardList;