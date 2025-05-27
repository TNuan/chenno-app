import React, { useState, useRef, useEffect } from 'react';
import { FiUpload } from 'react-icons/fi';

const AttachmentUploadModal = ({ isOpen, onClose, onUpload, uploadingAttachment }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dragCounterRef = useRef(0);
  const dropZoneRef = useRef(null);

  // Đặt các event handler bên ngoài hàm render, sử dụng useCallback
  useEffect(() => {
    if (!isOpen) return;
    
    // Reset counter khi component mount/unmount
    dragCounterRef.current = 0;
    setIsDragging(false);
    
    // Clean up khi component unmount hoặc modal đóng
    return () => {
      dragCounterRef.current = 0;
      setIsDragging(false);
    };
  }, [isOpen]);
  
  // Sử dụng useEffect để xử lý sự kiện drag & drop ở cấp document
  useEffect(() => {
    if (!isOpen || !dropZoneRef.current) return;
    
    const dropZone = dropZoneRef.current;
    
    // Handler cho các sự kiện drag & drop
    const handleDragEnter = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current++;
      setIsDragging(true);
    };
    
    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current--;
      if (dragCounterRef.current === 0) {
        setIsDragging(false);
      }
    };
    
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Không thay đổi isDragging trong dragOver để tránh nhấp nháy
    };
    
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Reset counter và state
      dragCounterRef.current = 0;
      setIsDragging(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        onUpload(file);
      }
    };
    
    // Đăng ký sự kiện
    dropZone.addEventListener('dragenter', handleDragEnter);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('drop', handleDrop);
    
    // Clean up sự kiện
    return () => {
      dropZone.removeEventListener('dragenter', handleDragEnter);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, [isOpen, onUpload]);

  // Handler cho file upload qua button click
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      onUpload(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Upload Attachment
          </h3>
        </div>
        
        <div className="p-4">
          <div 
            ref={dropZoneRef}
            className={`relative border-2 border-dashed rounded-lg p-6 text-center
              ${isDragging 
                ? 'border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20' 
                : 'border-gray-300 dark:border-gray-600'}`}
            // Không thêm các sự kiện trực tiếp tại đây
          >
            {/* Phần tử con được bọc trong div với pointer-events-none */}
            <div className="pointer-events-none">
              <FiUpload className={`w-12 h-12 mx-auto mb-2 ${
                isDragging ? 'text-blue-500' : 'text-gray-400'
              }`} />
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {isDragging 
                  ? 'Drop file here to upload' 
                  : 'Drag & drop a file here or click to select'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Maximum file size: 10MB
              </p>
            </div>
            
            {/* Button cần pointer-events-auto để click được */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAttachment}
              className={`pointer-events-auto mt-4 px-4 py-1.5 text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed ${
                uploadingAttachment 
                  ? 'bg-gray-400 text-white' 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {uploadingAttachment ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : 'Select File'}
            </button>
            
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploadingAttachment}
            />
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={uploadingAttachment}
            className="px-4 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttachmentUploadModal;