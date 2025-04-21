import React, { useState, useEffect } from 'react';
import { getWorkspaces } from '../../services/api';
import BoardList from '../Board/BoardList';

const WorkspaceList = () => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const data = await getWorkspaces();
        setWorkspaces(data.workspaces);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || 'Lỗi khi lấy danh sách workspaces');
        setLoading(false);
      }
    };
    fetchWorkspaces();
  }, []);

  if (loading) return <p className="text-center mt-10">Đang tải...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Danh sách Workspaces</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workspaces.map((workspace) => (
          <div
            key={workspace.id}
            className="p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer"
            onClick={() => setSelectedWorkspace(workspace.id)}
          >
            <h3 className="text-xl font-semibold">{workspace.name}</h3>
            <p className="text-gray-600">{workspace.description || 'Không có mô tả'}</p>
            <p className="text-sm text-gray-500 mt-2">
              Tạo bởi: {workspace.owner_id}
            </p>
          </div>
        ))}
      </div>
      {selectedWorkspace && <BoardList workspaceId={selectedWorkspace} />}
    </div>
  );
};

export default WorkspaceList;