import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiEdit2, FiTrash2, FiPlus, FiCheck, FiXCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

// Các màu cho label
const labelColorOptions = [
  '#FF5733', // Đỏ cam
  '#33FF57', // Xanh lá
  '#3357FF', // Xanh dương
  '#FF33A8', // Hồng
  '#33FFF6', // Xanh ngọc
  '#F6FF33', // Vàng
  '#FF33F6', // Tím hồng
  '#808080', // Xám
  '#FFA500', // Cam
  '#800080', // Tím
  '#008000', // Xanh lá đậm
  '#000080', // Xanh dương đậm
  '#FF0000', // Đỏ
  '#0000FF', // Xanh dương
  '#FFFF00', // Vàng tươi
];

const LabelsDropdown = ({ isOpen, onClose, board, onUpdate, anchorRef }) => {
  const [labels, setLabels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingLabel, setEditingLabel] = useState(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newLabel, setNewLabel] = useState({ name: '', color: '#808080' });
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          anchorRef.current && !anchorRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, anchorRef]);

  // Fetch labels when dropdown opens
  useEffect(() => {
    if (isOpen && board?.id) {
      fetchLabels();
    }
  }, [isOpen, board?.id]);

  // Position dropdown to match BoardMenu positioning (right side)
  const getDropdownPosition = () => {
    if (!anchorRef.current) return {};

    const anchorRect = anchorRef.current.getBoundingClientRect();
    const dropdownHeight = 450; // Estimated height
    const dropdownWidth = 350;
    
    let top, left;

    // Vertical positioning - same as BoardMenu (mt-2 = 8px below button)
    top = anchorRect.bottom + 8;

    // If dropdown would go below screen, position above
    if (top + dropdownHeight > window.innerHeight - 8) {
      top = anchorRect.top - dropdownHeight - 8;
    }

    // Horizontal positioning - show to the right of menu button (same as BoardMenu)
    left = anchorRect.right - dropdownWidth;

    // Ensure dropdown doesn't go off screen
    top = Math.max(8, Math.min(top, window.innerHeight - dropdownHeight - 8));
    left = Math.max(8, Math.min(left, window.innerWidth - dropdownWidth - 8));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 50
    };
  };

  const fetchLabels = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/labels/board/${board.id}`);
      setLabels(response.data.labels || []);
    } catch (error) {
      console.error('Failed to fetch labels:', error);
      toast.error('Không thể tải danh sách labels');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLabel = async () => {
    if (!newLabel.name.trim()) {
      toast.error('Tên label không được để trống');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/labels', {
        board_id: board.id,
        name: newLabel.name.trim(),
        color: newLabel.color
      });

      const createdLabel = response.data.label;
      setLabels(prev => [...prev, createdLabel]);
      setNewLabel({ name: '', color: '#808080' });
      setIsAddingNew(false);
      toast.success('Đã tạo label thành công');
    } catch (error) {
      console.error('Failed to create label:', error);
      toast.error('Không thể tạo label');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLabel = async (labelId, updatedData) => {
    setIsLoading(true);
    try {
      const response = await api.put(`/labels/${labelId}`, updatedData);
      const updatedLabel = response.data.label;
      
      setLabels(prev => prev.map(label => 
        label.id === labelId ? updatedLabel : label
      ));
      setEditingLabel(null);
      toast.success('Đã cập nhật label thành công');
    } catch (error) {
      console.error('Failed to update label:', error);
      toast.error('Không thể cập nhật label');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteLabel = async (labelId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa label này? Tất cả card đang sử dụng label sẽ bị xóa khỏi label này.')) {
      return;
    }

    setIsLoading(true);
    try {
      await api.delete(`/labels/${labelId}`);
      setLabels(prev => prev.filter(label => label.id !== labelId));
      toast.success('Đã xóa label thành công');
    } catch (error) {
      console.error('Failed to delete label:', error);
      toast.error('Không thể xóa label');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-88"
      style={getDropdownPosition()}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white">
          Labels
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        >
          <FiX className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Labels List */}
        <div className="max-h-64 overflow-y-auto mb-4">
          {isLoading && labels.length === 0 ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-blue-500"></div>
            </div>
          ) : labels.length > 0 ? (
            <div className="space-y-2">
              {labels.map(label => (
                <LabelItem
                  key={label.id}
                  label={label}
                  isEditing={editingLabel?.id === label.id}
                  onEdit={() => setEditingLabel({ ...label })}
                  onSave={(updatedData) => handleUpdateLabel(label.id, updatedData)}
                  onCancel={() => setEditingLabel(null)}
                  onDelete={() => handleDeleteLabel(label.id)}
                  isLoading={isLoading}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
              Chưa có label nào cho board này
            </div>
          )}
        </div>

        {/* Add New Label */}
        {isAddingNew ? (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Tạo label mới
            </h4>
            
            <input
              type="text"
              value={newLabel.name}
              onChange={(e) => setNewLabel(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Tên label..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
              autoFocus
            />

            {/* Color Picker */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Màu sắc:
              </label>
              <div className="flex flex-wrap gap-2">
                {labelColorOptions.map(color => (
                  <button
                    key={color}
                    onClick={() => setNewLabel(prev => ({ ...prev, color }))}
                    className={`w-6 h-6 rounded cursor-pointer transition-all ${
                      newLabel.color === color ? 'ring-2 ring-blue-500 ring-offset-2' : 'hover:scale-110'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setNewLabel({ name: '', color: '#808080' });
                }}
                disabled={isLoading}
                className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateLabel}
                disabled={!newLabel.name.trim() || isLoading}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Đang tạo...' : 'Tạo'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingNew(true)}
            className="w-full px-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 rounded transition-colors flex items-center justify-center border-t border-gray-200 dark:border-gray-700 pt-4"
          >
            <FiPlus className="w-4 h-4 mr-1" />
            Tạo label mới
          </button>
        )}
      </div>
    </div>
  );
};

// Component for individual label item (unchanged)
const LabelItem = ({ label, isEditing, onEdit, onSave, onCancel, onDelete, isLoading }) => {
  const [editData, setEditData] = useState({ name: label.name, color: label.color });

  useEffect(() => {
    if (isEditing) {
      setEditData({ name: label.name, color: label.color });
    }
  }, [isEditing, label]);

  const handleSave = () => {
    if (!editData.name.trim()) {
      toast.error('Tên label không được để trống');
      return;
    }
    onSave(editData);
  };

  if (isEditing) {
    return (
      <div className="border border-blue-200 dark:border-blue-700 rounded-lg p-3 bg-blue-50 dark:bg-blue-900/20">
        <input
          type="text"
          value={editData.name}
          onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-2"
          autoFocus
        />
        
        <div className="flex flex-wrap gap-1 mb-2">
          {labelColorOptions.slice(0, 8).map(color => (
            <button
              key={color}
              onClick={() => setEditData(prev => ({ ...prev, color }))}
              className={`w-5 h-5 rounded cursor-pointer transition-all ${
                editData.color === color ? 'ring-2 ring-blue-500 ring-offset-1' : 'hover:scale-110'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiXCircle className="w-4 h-4" />
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="p-1 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
          >
            <FiCheck className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 group">
      <div className="flex items-center flex-1">
        <div
          className="w-8 h-4 rounded mr-3 flex-shrink-0"
          style={{ backgroundColor: label.color }}
        />
        <span className="text-sm text-gray-900 dark:text-white flex-1">
          {label.name}
        </span>
        {label.usage_count > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
            ({label.usage_count} cards)
          </span>
        )}
      </div>
      
      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          disabled={isLoading}
          className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
          title="Chỉnh sửa"
        >
          <FiEdit2 className="w-3 h-3" />
        </button>
        <button
          onClick={onDelete}
          disabled={isLoading}
          className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
          title="Xóa"
        >
          <FiTrash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default LabelsDropdown;