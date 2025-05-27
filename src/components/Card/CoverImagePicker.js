import React, { useState } from 'react';
import { FiX, FiImage, FiCheck } from 'react-icons/fi';

// Import background images tương tự CreateBoardModal
const backgroundImages = require.context('../../assets/images/bg-cards', false, /\.(png|jpe?g|svg)$/);
const bgImageList = backgroundImages.keys().map(backgroundImages);

// Danh sách màu có sẵn
const AVAILABLE_COLORS = [
  '#3B82F6', // Blue
  '#EF4444', // Red
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#F97316', // Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6B7280', // Gray
  '#DC2626', // Red-600
  '#059669', // Green-600
];

const CoverImagePicker = ({ isOpen, onClose, currentCover, onCoverSelect }) => {
  const [activeTab, setActiveTab] = useState('images'); // 'images' hoặc 'colors'

  if (!isOpen) return null;

  const handleImageSelect = (imageUrl) => {
    onCoverSelect({
      type: 'image',
      value: imageUrl // Lưu URL đầy đủ thay vì tên file
    });
    onClose();
  };

  const handleColorSelect = (color) => {
    onCoverSelect({
      type: 'color',
      value: color
    });
    onClose();
  };

  const handleRemoveCover = () => {
    onCoverSelect(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Cover Image
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('images')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'images'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            <FiImage className="w-4 h-4 inline mr-2" />
            Images
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex-1 px-4 py-2 text-sm font-medium ${
              activeTab === 'colors'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
          >
            Colors
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {activeTab === 'images' ? (
            <div className="grid grid-cols-3 gap-3">
              {bgImageList.map((imageUrl, index) => {
                const isSelected = currentCover?.type === 'image' && currentCover?.value === imageUrl;
                return (
                  <div
                    key={index}
                    className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleImageSelect(imageUrl)}
                  >
                    <img
                      src={imageUrl}
                      alt={`Cover ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback nếu ảnh không load được
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="hidden w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 items-center justify-center text-white text-xs">
                      Image {index + 1}
                    </div>
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="bg-white rounded-full p-1">
                          <FiCheck className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-6 gap-3">
              {AVAILABLE_COLORS.map((color) => {
                const isSelected = currentCover?.type === 'color' && currentCover?.value === color;
                return (
                  <div
                    key={color}
                    className={`aspect-square rounded-lg cursor-pointer border-2 transition-all relative ${
                      isSelected ? 'border-gray-400 ring-2 ring-gray-200' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorSelect(color)}
                  >
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white rounded-full p-1">
                          <FiCheck className="w-3 h-3 text-green-600" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between">
          <button
            onClick={handleRemoveCover}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm"
            disabled={!currentCover}
          >
            Remove Cover
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoverImagePicker;