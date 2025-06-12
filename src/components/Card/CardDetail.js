import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiUser, FiClock, FiTag, FiPaperclip, FiMessageSquare, FiAlertCircle, FiEdit, FiChevronDown, FiImage, FiUpload, FiDownload, FiTrash2, FiFile, FiArchive } from 'react-icons/fi';
import { format } from 'date-fns';
import api, { uploadAttachment, getCardAttachments, deleteAttachment, downloadAttachment, unarchiveCard } from '../../services/api';
import { createEditableProps } from '../../utils/contentEditable';
import { useAlert } from '../../contexts/AlertContext';
import { emitBoardChange } from '../../services/socket';
import CoverImagePicker from './CoverImagePicker';
import AttachmentUploadModal from './AttachmentUploadModal';
import LabelDisplay from './LabelDisplay';
import CardActions from './CardActions';

// Hàm hỗ trợ để lấy tên và màu cho trạng thái
const getStatusInfo = (status) => {
  switch (status) {
    case 'todo':
      return { name: 'To Do', color: 'bg-gray-400' };
    case 'in_progress':
      return { name: 'In Progress', color: 'bg-blue-500' };
    case 'review':
      return { name: 'Review', color: 'bg-purple-500' };
    case 'done':
      return { name: 'Completed', color: 'bg-green-500' };
    case 'blocked':
      return { name: 'Blocked', color: 'bg-red-500' };
    default:
      return { name: 'To Do', color: 'bg-gray-400' };
  }
};

// Hàm hỗ trợ để lấy tên và màu cho mức độ ưu tiên
const getPriorityInfo = (level) => {
  switch (level) {
    case 0:
      return { name: 'None', color: 'bg-gray-300 text-gray-700' };
    case 1:
      return { name: 'Low', color: 'bg-blue-200 text-blue-800' };
    case 2:
      return { name: 'Medium', color: 'bg-yellow-200 text-yellow-800' };
    case 3:
      return { name: 'High', color: 'bg-red-200 text-red-800' };
    default:
      return { name: 'None', color: 'bg-gray-300 text-gray-700' };
  }
};

// Hàm hỗ trợ để lấy tên và màu cho độ khó
const getDifficultyInfo = (level) => {
  switch (level) {
    case 0:
      return { name: 'None', color: 'bg-gray-300 text-gray-700' };
    case 1:
      return { name: 'Easy', color: 'bg-green-200 text-green-800' };
    case 2:
      return { name: 'Medium', color: 'bg-yellow-200 text-yellow-800' };
    case 3:
      return { name: 'Hard', color: 'bg-red-200 text-red-800' };
    default:
      return { name: 'None', color: 'bg-gray-300 text-gray-700' };
  }
};

const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'review', label: 'Review' },
  { value: 'done', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' }
];

const priorityOptions = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Low' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'High' }
];

const difficultyOptions = [
  { value: 0, label: 'None' },
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' }
];

const CardDetail = ({ card, isOpen, onClose, onUpdate, boardMembers = [], canModify, socketRef }) => {
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [showAttachmentUpload, setShowAttachmentUpload] = useState(false);
  
  const modalRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const statusMenuRef = useRef(null);
  const { showConfirm } = useAlert();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
  const priorityMenuRef = useRef(null);
  const [isDifficultyMenuOpen, setIsDifficultyMenuOpen] = useState(false);
  const difficultyMenuRef = useRef(null);

  // Thêm state cho việc chỉnh sửa description
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState('');
  const descriptionTextareaRef = useRef(null);

  // Fetch card details when opened
  useEffect(() => {
    if (isOpen && card?.id) {
      fetchCardDetails(card.id);
    }
  }, [isOpen, card]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!isConfirmOpen && modalRef.current && !modalRef.current.contains(event.target)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isConfirmOpen]);

  // Update cardTitle when cardData changes
  useEffect(() => {
    if (cardData) {
      setCardTitle(cardData.title);
    }
  }, [cardData]);

  // Handle click outside for status dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusMenuRef.current && !statusMenuRef.current.contains(event.target)) {
        setIsStatusMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Escape key to close
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen]);

  // Lắng nghe các sự kiện socket khi CardDetail được mở
  useEffect(() => {
    if (isOpen && card?.id && cardData?.board_id && socketRef) {
      // Lắng nghe khi có comment mới được thêm vào card này
      socketRef.on('board_updated', (data) => {
        console.log('Received board update:', data);
        if (data.changeType === 'card_updated' && data.payload?.id=== card.id) {
          console.log(`Card ${card.id} updated:`, data.payload);
          // Cập nhật cardData với dữ liệu mới
          setCardData(prevData => {
            if (!prevData) return data.payload; // Nếu chưa có cardData, trả về dữ liệu mới
            return {
              ...prevData,
              ...data.payload // Cập nhật các trường mới từ payload
            };
          });
        } else if (data.changeType === 'comment_added' && data.payload?.card_id === card.id) {
          setCardData(prevData => {
            if (!prevData) return prevData;
            
            return {
              ...prevData,
              comments: [
                ...(prevData.comments || []),
                data.payload.comment
              ]
            };
          });
        } else if (data.changeType === 'attachment_added' && data.payload?.card_id === card.id) {
          console.log(`New attachment added to card ${card.id}:`, data.payload.attachment);
          
          // Cập nhật cả cardData và attachments state
          setCardData(prevData => {
            if (!prevData) return prevData;
            
            return {
              ...prevData,
              attachments: [
                ...(prevData.attachments || []),
                data.payload.attachment
              ]
            };
          });
          
          // Quan trọng: Thêm attachment mới vào state attachments riêng biệt
          setAttachments(prev => [data.payload.attachment, ...prev]);
        } else if (data.changeType === 'attachment_removed' && data.payload?.card_id === card.id) {
          const removedAttachmentId = data.payload.attachment_id;

          // Xóa khỏi cả cardData và attachments state
          setCardData(prevData => {
            if (!prevData || !prevData.attachments) return prevData;
            
            return {
              ...prevData,
              attachments: prevData.attachments.filter(att => att.id !== removedAttachmentId)
            };
          });
          
          // Xóa khỏi attachments state
          setAttachments(prev => prev.filter(att => att.id !== removedAttachmentId));
        } else if (data.changeType === 'label_added_to_card' && data.payload?.card_id === card.id) {
          console.log(`Label added to card ${card.id}:`, data.payload.label);
          
          // Cập nhật cardData với label mới
          setCardData(prevData => {
            if (!prevData) return prevData;
            
            return {
              ...prevData,
              labels: [
                ...(prevData.labels || []),
                data.payload.label
              ]
            };
          });
        } else if (data.changeType === 'label_removed_from_card' && Number(data.payload?.card_id) === card.id) {
          const removedLabelId = Number(data.payload.label_id);

          // Xóa khỏi cardData
          setCardData(prevData => {
            if (!prevData || !prevData.labels) return prevData;
            
            return {
              ...prevData,
              labels: prevData.labels.filter(label => label.id !== removedLabelId)
            };
          });
        }
      });
  
    }
  }, [isOpen, card?.id, cardData?.board_id, socketRef]);

  const fetchCardDetails = async (cardId) => {
    setLoading(true);
    try {
      const response = await api.get(`/cards/details/${cardId}`);
      setCardData(response.data.card);

      // Fetch attachments
      try {
        const attachmentResponse = await getCardAttachments(cardId);
        setAttachments(attachmentResponse.attachments || []);
      } catch (attachmentError) {
        console.error('Failed to fetch attachments:', attachmentError);
        setAttachments([]);
      }

      // Không cần khởi tạo editFields nữa
    } catch (error) {
      console.error('Failed to fetch card details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const response = await api.post('/comments', {
        card_id: card.id,
        content: newComment.trim()
      });

      // Cập nhật cardData trong CardDetail với comment mới
      setCardData(prevData => ({
        ...prevData,
        comments: [
          ...(prevData.comments || []),
          response.data.comment
        ]
      }));

      // Chỉ notify parent component để cập nhật comment_count, không thay đổi dữ liệu khác
      if (onUpdate) {
        // Tạo object mới chỉ với những field cần thiết cho component cha
        const updatedCardForParent = {
          ...card, // Giữ nguyên dữ liệu card gốc từ component cha
          comment_count: (card.comment_count || 0) + 1 // Chỉ tăng comment_count
        };
        onUpdate(updatedCardForParent);
      }

      // Clear the input
      setNewComment('');

    } catch (error) {
      console.error('Failed to add comment', error);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleCommentKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit();
    }
  };

  const handleDelete = async () => {
    setIsConfirmOpen(true);
    
    showConfirm(
      'Xóa thẻ',
      'Bạn có chắc chắn muốn xóa thẻ này? Mọi nội dung, tệp đính kèm và bình luận sẽ bị xóa vĩnh viễn.',
      async () => {
        setLoading(true);
        try {
          await api.delete(`/cards/${card.id}`);

          // Notify parent component
          if (onUpdate) {
            onUpdate(null, true); // Pass true to indicate deletion
          }
          
          onClose();
        } catch (error) {
          console.error('Failed to delete card', error);
        } finally {
          setLoading(false);
          setIsConfirmOpen(false);
        }
      },
      () => {
        setIsConfirmOpen(false);
      }
    );
  };

  const handleClose = () => {
    // if (editMode) {
    //   if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
    //     setEditMode(false);
    //     onClose();
    //   }
    // } else {
      onClose();
    // }
  };

  const handleCardTitleChange = (e) => {
    setCardTitle(e.target.value);
  };

  const handleCardTitleSubmit = async () => {
    if (!cardTitle.trim() || cardTitle.trim() === cardData.title) {
      setCardTitle(cardData.title);
      setIsEditingTitle(false);
      return;
    }

    setLoading(true);
    try {
      const updatedCard = {
        ...cardData,
        title: cardTitle.trim()
      };

      const response = await api.put(`/cards/${card.id}`, updatedCard);

      // Update local state
      setCardData(response.data.card);

      // Notify parent component
      if (onUpdate) {
        onUpdate(response.data.card);
      }

      // Emit socket event for real-time updates
      if (cardData && cardData.board_id) {
        emitBoardChange(cardData.board_id, 'card_updated', response.data.card);
      }
    } catch (error) {
      console.error('Failed to update card title', error);
      setCardTitle(cardData.title);
    } finally {
      setIsEditingTitle(false);
      setLoading(false);
    }
  };

  const handleCardTitleCancel = () => {
    setCardTitle(cardData.title);
    setIsEditingTitle(false);
  };

  const handleStatusChangeFromHeader = async (status) => {
    if (status === cardData.status) {
      setIsStatusMenuOpen(false);
      return;
    }

    setLoading(true);
    try {
      const updatedCard = {
        ...cardData,
        status
      };

      const response = await api.put(`/cards/${card.id}`, updatedCard);

      // Update local state
      setCardData(response.data.card);

      // Không cần cập nhật editFields nữa
      // if (editMode) {
      //   setEditFields(prev => ({
      //     ...prev,
      //     status
      //   }));
      // }

      // Notify parent component
      if (onUpdate) {
        onUpdate(response.data.card);
      }

      // Emit socket event for real-time updates
      if (cardData && cardData.board_id) {
        emitBoardChange(cardData.board_id, 'card_updated', response.data.card);
      }
    } catch (error) {
      console.error('Failed to update card status', error);
    } finally {
      setIsStatusMenuOpen(false);
      setLoading(false);
    }
  };

  const handleCoverSelect = async (coverData) => {
    if (!canModify) return;

    setLoading(true);
    try {
      const updatedCard = {
        ...cardData,
        cover_img: coverData ? coverData.value : null // Lưu trực tiếp value (URL hoặc màu)
      };

      const response = await api.put(`/cards/${card.id}`, updatedCard);

      // Update local state
      setCardData(updatedCard);

      // Notify parent component
      if (onUpdate) {
        onUpdate(response.data.card);
      }

    } catch (error) {
      console.error('Failed to update card cover', error);
    } finally {
      setLoading(false);
    }
  };

  // Thêm useEffect để cập nhật descriptionText khi cardData thay đổi
  useEffect(() => {
    if (cardData) {
      setDescriptionText(cardData.description || '');
    }
  }, [cardData]);

  // Thêm useEffect để auto-resize textarea khi chỉnh sửa description
  useEffect(() => {
    if (isEditingDescription && descriptionTextareaRef.current) {
      descriptionTextareaRef.current.style.height = 'auto';
      descriptionTextareaRef.current.style.height = `${descriptionTextareaRef.current.scrollHeight}px`;
    }
  }, [descriptionText, isEditingDescription]);

  // Thêm handler để xử lý description
  const handleDescriptionChange = (e) => {
    setDescriptionText(e.target.value);
  };

  const handleDescriptionSubmit = async () => {
    if (descriptionText === cardData.description) {
      setIsEditingDescription(false);
      return;
    }

    setLoading(true);
    try {
      const updatedCard = {
        ...cardData,
        description: descriptionText.trim()
      };

      const response = await api.put(`/cards/${card.id}`, updatedCard);

      // Update local state
      setCardData(response.data.card);

      // Notify parent component
      if (onUpdate) {
        onUpdate(response.data.card);
      }

      // Emit socket event for real-time updates
      if (cardData && cardData.board_id) {
        emitBoardChange(cardData.board_id, 'card_updated', response.data.card);
      }
    } catch (error) {
      console.error('Failed to update card description', error);
      setDescriptionText(cardData.description || '');
    } finally {
      setIsEditingDescription(false);
      setLoading(false);
    }
  };

  const handleDescriptionCancel = () => {
    setDescriptionText(cardData?.description || '');
    setIsEditingDescription(false);
  };

  const editableProps = createEditableProps(
    cardTitle,
    handleCardTitleChange,
    handleCardTitleSubmit,
    handleCardTitleCancel
  );

  // Tạo một hàm riêng để xử lý file để tái sử dụng giữa drop và click
  const processFileUpload = (file) => {
    if (!file || !canModify) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    setUploadingAttachment(true);
    uploadAttachment(card.id, file)
      .then(response => {
        // Add new attachment to list
        setAttachments(prev => [response.attachment, ...prev]);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

      // Chỉ notify parent component để cập nhật attachment_count, không thay đổi dữ liệu khác
        if (onUpdate) {
          // Tạo object mới chỉ với những field cần thiết cho component cha
          const updatedCardForParent = {
            ...card, // Giữ nguyên dữ liệu card gốc từ component cha
            attachment_count: (card.attachment_count || 0) + 1 // Chỉ tăng attachment_count
          };
          onUpdate(updatedCardForParent);
        }
        setShowAttachmentUpload(false);
      })
      .catch(error => {
        console.error('Failed to upload attachment:', error);
        alert('Failed to upload file. Please try again.');
      })
      .finally(() => {
        setUploadingAttachment(false);
      });
  };

  // Cập nhật handleFileUpload để sử dụng hàm processFileUpload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    processFileUpload(file);
  };

  // Handler để xóa attachment
  const handleDeleteAttachment = async (attachmentId, fileName) => {
    if (!canModify) return;
    
    if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
      return;
    }

    try {
      await deleteAttachment(attachmentId);
      
      // Remove from local state
      setAttachments(prev => prev.filter(att => att.id !== attachmentId));
      
      // Cập nhật cardData nếu có
      setCardData(prevData => {
        if (!prevData || !prevData.attachments) return prevData;
        
        return {
          ...prevData,
          attachments: prevData.attachments.filter(att => att.id !== attachmentId)
        };
      });
      
    } catch (error) {
      console.error('Failed to delete attachment:', error);
      alert('Failed to delete attachment. Please try again.');
    }
  };

  // Handler để download attachment
  const handleDownloadAttachment = (attachmentId, fileName) => {
    downloadAttachment(attachmentId, fileName);
  };

  // Helper function để format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Helper function để get file icon
  const getFileIcon = (fileType) => {
    if (fileType?.startsWith('image/')) return '🖼️';
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('word')) return '📝';
    if (fileType?.includes('excel') || fileType?.includes('sheet')) return '📊';
    if (fileType?.includes('powerpoint') || fileType?.includes('presentation')) return '📈';
    if (fileType?.includes('zip') || fileType?.includes('rar')) return '🗜️';
    if (fileType?.includes('video/')) return '🎥';
    if (fileType?.includes('audio/')) return '🎵';
    return '📄';
  };

  const handleUnarchiveCard = async () => {
    setLoading(true);
    try {
      await unarchiveCard(card.id);

      // Notify parent component that card was unarchived
      if (onUpdate) {
        onUpdate(cardData, false); // false indicates card should be shown again
      }
      
      onClose();
    } catch (error) {
      console.error('Failed to unarchive card', error);
      alert('Unarchive card thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !card) return null;

  const statusInfo = getStatusInfo(cardData?.status || 'todo');
  const priorityInfo = getPriorityInfo(cardData?.priority_level || 0);
  const difficultyInfo = getDifficultyInfo(cardData?.difficulty_level || 0);

  // Thêm vào đầu component
  const isImageCover = cardData?.cover_img && !cardData.cover_img.startsWith('#');
  const isColorCover = cardData?.cover_img && cardData.cover_img.startsWith('#');

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        {/* Header với Cover Background */}
        <div 
          className={`relative border-b border-gray-200 dark:border-gray-700 transition-all duration-300 ${
            isImageCover 
              ? 'min-h-[150px] md:min-h-[150px]' // Chiều cao lớn cho ảnh
              : 'min-h-[64px]' // Chiều cao bình thường
          }`}
          style={{
            backgroundImage: isImageCover ? `url(${cardData.cover_img})` : 'none',
            backgroundColor: isColorCover ? cardData.cover_img : 'transparent',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Smart overlay dựa trên loại cover */}
          {isImageCover && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/10" />
          )}
          {isColorCover && (
            <div className="absolute inset-0 bg-black/20" />
          )}
          
          {/* Tất cả các phần tử trên một dòng */}
          <div className={`relative h-full flex items-${isImageCover ? 'end' : 'center'} p-4`}>
            <div className="w-full flex items-center justify-between">
              {/* Bên trái: Status + Title */}
              <div className="flex items-center flex-1 mr-2">
                {/* Status Badge với Dropdown */}
                <div className="relative mr-2 flex-shrink-0" ref={statusMenuRef}>
                  <button
                    onClick={() => canModify && setIsStatusMenuOpen(!isStatusMenuOpen)}
                    className={`h-6 px-2.5 py-0.5 text-xs text-white rounded flex items-center ${statusInfo.color} ${canModify ? 'hover:brightness-110 cursor-pointer' : 'cursor-default'} shadow-sm`}
                    disabled={!canModify || loading}
                  >
                    {statusInfo.name}
                    {canModify && <FiChevronDown className="ml-1 w-3 h-3" />}
                  </button>

                  {isStatusMenuOpen && canModify && (
                    <div className="absolute left-0 mt-1 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                      {statusOptions.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleStatusChangeFromHeader(option.value)}
                          className={`w-full text-left px-3 py-1.5 text-sm flex items-center ${cardData?.status === option.value
                            ? 'bg-gray-100 dark:bg-gray-700'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                        >
                          <span className={`w-2 h-2 rounded-full mr-2 ${getStatusInfo(option.value).color}`}></span>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Title với Inline Edit */}
                {isEditingTitle && canModify ? (
                  <input
                    {...editableProps}
                    className="flex-1 min-w-0 px-2 py-1 text-base font-medium text-gray-900 dark:text-gray-100 bg-white/90 dark:bg-gray-700/90 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                ) : (
                  <h2
                    className={`text-lg font-medium px-2 py-1 flex-1 truncate rounded transition-colors ${canModify ? 'cursor-pointer hover:bg-white/20 dark:hover:bg-black/20' : ''} ${
                      cardData?.cover_img ? 'text-white drop-shadow-lg' : 'text-gray-800 dark:text-gray-200'
                    }`}
                    onClick={() => canModify && setIsEditingTitle(true)}
                    title={cardData?.title || card.title}
                  >
                    {loading && !cardData ? 'Loading...' : cardData?.title || card.title}
                  </h2>
                )}
              </div>
              
              {/* Bên phải: Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Action Button & Dropdown */}
                {canModify && (
                  <CardActions
                    cardData={cardData}
                    onClose={onClose}
                    onUpdate={onUpdate}
                    hasCover={isImageCover || isColorCover}
                    canModify={canModify}
                  />
                )}
                
                {/* Add/Change Cover Button */}
                {canModify && (
                  <button
                    onClick={() => setShowCoverPicker(true)}
                    className={`p-1.5 rounded-full transition-colors ${
                      cardData?.cover_img 
                        ? 'bg-black/30 hover:bg-black/50 text-white' 
                        : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                    }`}
                    title={cardData?.cover_img ? "Change cover" : "Add cover"}
                  >
                    <FiImage className="w-4 h-4" />
                  </button>
                )}
                
                {/* Close Button */}
                <button
                  onClick={handleClose}
                  className={`p-1.5 rounded-full transition-colors ${
                    cardData?.cover_img 
                      ? 'bg-black/30 hover:bg-black/50 text-white' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {loading && !cardData ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Content - chia thành left main panel và right sidebar */}
            <div className="flex-1 flex flex-col md:flex-row overflow-auto">
              {/* Main content panel */}
              <div className="flex-1 p-4 overflow-y-auto">                
                {/* Card title */}
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  {cardData?.title}
                </h1>

                {/* Description */}
                <div className="mb-6 dark:bg-gray-800 rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <FiAlertCircle className="mr-1" /> Description
                    </h3>
                    {canModify && !isEditingDescription && (
                      <button
                        onClick={() => setIsEditingDescription(true)}
                        className="p-1 text-xs text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                        title="Edit description"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {isEditingDescription && canModify ? (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-2">
                      <textarea
                        ref={descriptionTextareaRef}
                        className="w-full p-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[100px] resize-none"
                        placeholder="Add a description..."
                        value={descriptionText}
                        onChange={handleDescriptionChange}
                        disabled={loading}
                        autoFocus
                      />
                      <div className="mt-2 flex justify-end space-x-2">
                        <button
                          className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                          onClick={handleDescriptionCancel}
                          disabled={loading}
                        >
                          Cancel
                        </button>
                        <button
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors disabled:opacity-50"
                          onClick={handleDescriptionSubmit}
                          disabled={loading}
                        >
                          {loading ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Saving...
                            </span>
                          ) : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className={`p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap ${
                        canModify ? 'hover:bg-gray-100 dark:hover:bg-gray-725 cursor-pointer' : ''
                      }`}
                      onClick={() => canModify && !isEditingDescription && setIsEditingDescription(true)}
                    >
                      {cardData?.description ? 
                        cardData.description : 
                        <span className="text-gray-400 italic">No description provided. Click to add.</span>}
                    </div>
                  )}
                </div>

                {/* Attachments section */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                      <FiPaperclip className="mr-1" /> Attachments ({attachments.length})
                    </h3>
                    {canModify && (
                      <button
                        onClick={() => setShowAttachmentUpload(true)}
                        className="p-1 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                        title="Upload file"
                      >
                        <FiUpload className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  
                  {attachments.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                      {attachments.map(attachment => (
                        <div key={attachment.id} className="flex items-center justify-between text-sm p-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
                          <button
                            onClick={() => handleDownloadAttachment(attachment.id, attachment.file_name)}
                            className="flex items-center flex-1 min-w-0 text-left"
                            title={`${attachment.file_name} (${formatFileSize(attachment.file_size)} • ${format(new Date(attachment.created_at), 'MMM d, yyyy')}${attachment.uploaded_by_username ? ` • by ${attachment.uploaded_by_username}` : ''})`}
                          >
                            <span className="mr-1 flex-shrink-0">{getFileIcon(attachment.file_type)}</span>
                            <span className="truncate text-gray-900 dark:text-gray-100">
                              {attachment.file_name}
                            </span>
                          </button>
                          {canModify && (
                            <button
                              onClick={() => handleDeleteAttachment(attachment.id, attachment.file_name)}
                              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 ml-1 flex-shrink-0"
                              title="Delete"
                            >
                              <FiTrash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-3 border border-dashed border-gray-200 dark:border-gray-600 rounded">
                      <FiPaperclip className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">No files attached</p>
                      {canModify && (
                        <button
                          onClick={() => setShowAttachmentUpload(true)}
                          className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Add attachment
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Comments section - giữ nguyên như code hiện tại */}
                <div className="mt-6 flex flex-col">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                    <FiMessageSquare className="mr-1" /> Comments
                  </h3>

                  <div className="border border-gray-200 dark:border-gray-700 dark:bg-gray-800 rounded-md overflow-hidden flex flex-col">
                    <div className="overflow-y-auto max-h-[200px] flex-1 bg-gray-50 dark:bg-gray-800">
                      {cardData?.comments && cardData.comments.length > 0 ? (
                        <div className="p-2 space-y-2">
                          {cardData.comments.map(comment => (
                            <div key={comment.id} className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm text-xs">
                              <div className="flex items-center mb-1">
                                <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 text-xs font-bold mr-1.5">
                                  {comment.user?.username ? comment.user.username.charAt(0).toUpperCase() :
                                    comment.username ? comment.username.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <span className="font-medium text-gray-900 dark:text-gray-100 text-xs">
                                  {comment.user?.username || comment.username || 'User'}
                                </span>
                                <span className="text-xxs text-gray-500 dark:text-gray-400 ml-2">
                                  {format(new Date(comment.created_at), 'MMM d, h:mm a')}
                                </span>
                              </div>
                              <p className="pl-6 text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {comment.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center h-[80px] text-gray-500 dark:text-gray-400 text-xs">
                          No comments yet
                        </div>
                      )}
                    </div>

                    <div className="p-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                      <textarea
                        className="w-full p-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Write a comment..."
                        rows={1}
                        value={newComment}
                        onChange={handleCommentChange}
                        onKeyDown={handleCommentKeyDown}
                        disabled={commentLoading}
                      />
                      <div className="mt-1 text-right">
                        <button
                          className="px-2 py-1 bg-blue-600 text-white rounded-md text-xs hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleCommentSubmit}
                          disabled={!newComment.trim() || commentLoading}
                        >
                          {commentLoading ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-1 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Posting...
                            </span>
                          ) : "Add"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Sidebar */}
              <div className="w-full md:w-72 p-4 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
                <div className="space-y-4">

                  {/* Assignee */}
                  <div>
                    <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">Assignee</h4>
                    {canModify ? (
                      <select
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                        value={cardData?.assigned_to || 'none'}
                        onChange={(e) => {
                          const value = e.target.value;
                          const assignedTo = value === 'none' ? null : parseInt(value, 10);
                          
                          if (assignedTo === cardData?.assigned_to) return;
                          
                          setLoading(true);
                          const cardUpdated = { ...cardData, assigned_to: assignedTo };
                          api.put(`/cards/${card.id}`, cardUpdated)
                          .then(response => {
                            setCardData(cardUpdated);
                            if (onUpdate) {
                              onUpdate(response.data.card);
                            }
                          })
                          .catch(error => {
                            console.error('Failed to update assignee', error);
                          })
                          .finally(() => {
                            setLoading(false);
                          });
                        }}
                        disabled={loading}
                      >
                        <option value="none">Unassigned</option>
                        {boardMembers.map(member => (
                          <option key={member.user_id} value={member.user_id}>
                            {member.username || member.email}
                          </option>
                        ))}
                      </select>
                    ) : (
                      cardData?.assigned_to ? (
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-200 text-xs font-medium mr-2">
                            {cardData.assigned_to_username ? cardData.assigned_to_username.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <span className="text-sm text-gray-800 dark:text-gray-200">
                            {cardData.assigned_to_username || 'Unknown User'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Unassigned</span>
                      )
                    )}
                  </div>

                  {/* Due Date */}
                  <div>
                    <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">Due Date</h4>
                    {canModify ? (
                      <div className="flex items-center">
                        <input
                          type="date"
                          className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                          value={cardData?.due_date ? new Date(cardData.due_date).toISOString().split('T')[0] : ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            const dueDate = value ? new Date(value).toISOString() : null;
                            
                            if ((dueDate && cardData?.due_date && new Date(dueDate).getTime() === new Date(cardData.due_date).getTime()) || 
                                (!dueDate && !cardData?.due_date)) {
                              return;
                            }
                            
                            setLoading(true);
                            const cardUpdated = { ...cardData, due_date: dueDate };
                            api.put(`/cards/${card.id}`, cardUpdated)
                            .then(response => {
                              setCardData(cardUpdated);
                              if (onUpdate) {
                                onUpdate(response.data.card);
                              }
                            })
                            .catch(error => {
                              console.error('Failed to update due date', error);
                            })
                            .finally(() => {
                              setLoading(false);
                            });
                          }}
                          disabled={loading}
                        />
                        {cardData?.due_date && (
                          <button
                            onClick={() => {
                              setLoading(true);
                              api.put(`/cards/${card.id}`, {
                                ...cardData,
                                due_date: null
                              })
                              .then(response => {
                                setCardData(response.data.card);
                                if (onUpdate) {
                                  onUpdate(response.data.card);
                                }
                                if (cardData && cardData.board_id) {
                                  emitBoardChange(cardData.board_id, 'card_updated', response.data.card);
                                }
                              })
                              .catch(error => {
                                console.error('Failed to clear due date', error);
                              })
                              .finally(() => {
                                setLoading(false);
                              });
                            }}
                            className="ml-2 p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                            title="Clear due date"
                            disabled={loading}
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      cardData?.due_date ? (
                        <div className="flex items-center text-sm">
                          <FiClock className="mr-1 text-gray-500 dark:text-gray-400" />
                          <span className="text-gray-800 dark:text-gray-200">
                            {format(new Date(cardData.due_date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">None</span>
                      )
                    )}
                  </div>
                  

                  <div className="flex justify-between gap-4">
                    {/* Priority */}
                    <div className="">
                      <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">Priority</h4>
                      {canModify ? (
                        <div className="relative" ref={priorityMenuRef}>
                          <button
                            onClick={() => setIsPriorityMenuOpen(!isPriorityMenuOpen)}
                            className={`h-6 px-2.5 py-0.5 text-xs rounded flex items-center justify-between w-20 ${priorityInfo.color} ${canModify ? 'hover:brightness-110 cursor-pointer' : 'cursor-default'} shadow-sm`}
                            disabled={loading}
                          >
                            <span>{priorityInfo.name}</span>
                            {canModify && <FiChevronDown className="ml-1 w-3 h-3" />}
                          </button>

                          {isPriorityMenuOpen && (
                            <div className="fixed w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                                  style={{
                                    top: priorityMenuRef.current ? priorityMenuRef.current.getBoundingClientRect().bottom + 4 : 'auto',
                                    left: priorityMenuRef.current ? priorityMenuRef.current.getBoundingClientRect().left : 'auto'
                                  }}>
                              {priorityOptions.map(option => {
                                const optionInfo = getPriorityInfo(option.value);
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                      const priorityLevel = parseInt(option.value, 10);
                                      
                                      if (priorityLevel === cardData?.priority_level) {
                                        setIsPriorityMenuOpen(false);
                                        return;
                                      }
                                      
                                      setLoading(true);
                                      const cardUpdated = { ...cardData, priority_level: priorityLevel };
                                      api.put(`/cards/${card.id}`, cardUpdated)
                                        .then(response => {
                                          setCardData(cardUpdated);
                                        })
                                        .catch(error => {
                                          console.error('Failed to update priority', error);
                                        })
                                        .finally(() => {
                                          setIsPriorityMenuOpen(false);
                                          setLoading(false);
                                        });
                                    }}
                                    className={`w-full text-left px-3 py-1.5 text-sm flex items-center ${
                                      cardData?.priority_level === option.value
                                        ? 'bg-gray-100 dark:bg-gray-700'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                  >
                                    <span className={`w-2 h-2 rounded-full mr-2 ${optionInfo.color.replace('text-', 'bg-')}`}></span>
                                    {option.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`inline-block px-2.5 py-0.5 text-xs rounded ${priorityInfo.color}`}>
                          {priorityInfo.name}
                        </div>
                      )}
                    </div>

                    {/* Difficulty */}
                    <div>
                      <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">Difficulty</h4>
                      {canModify ? (
                        <div className="relative" ref={difficultyMenuRef}>
                          <button
                            onClick={() => setIsDifficultyMenuOpen(!isDifficultyMenuOpen)}
                            className={`h-6 px-2.5 py-0.5 text-xs rounded flex items-center justify-between w-20 ${difficultyInfo.color} ${canModify ? 'hover:brightness-110 cursor-pointer' : 'cursor-default'} shadow-sm`}
                            disabled={loading}
                          >
                            <span>{difficultyInfo.name}</span>
                            {canModify && <FiChevronDown className="ml-1 w-3 h-3" />}
                          </button>

                          {isDifficultyMenuOpen && (
                            <div className="fixed w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
                                  style={{
                                    top: difficultyMenuRef.current ? difficultyMenuRef.current.getBoundingClientRect().bottom + 4 : 'auto',
                                    left: difficultyMenuRef.current ? difficultyMenuRef.current.getBoundingClientRect().left : 'auto'
                                  }}>
                              {difficultyOptions.map(option => {
                                const optionInfo = getDifficultyInfo(option.value);
                                return (
                                  <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                      const difficultyLevel = parseInt(option.value, 10);
                                      
                                      if (difficultyLevel === cardData?.difficulty_level) {
                                        setIsDifficultyMenuOpen(false);
                                        return;
                                      }
                                      
                                      setLoading(true);
                                      const cardUpdated = { ...cardData, difficulty_level: difficultyLevel };
                                      api.put(`/cards/${card.id}`, cardUpdated)
                                        .then(response => {
                                          setCardData(cardUpdated);
                                        })
                                        .catch(error => {
                                          console.error('Failed to update difficulty', error);
                                        })
                                        .finally(() => {
                                          setIsDifficultyMenuOpen(false);
                                          setLoading(false);
                                        });
                                    }}
                                    className={`w-full text-left px-3 py-1.5 text-sm flex items-center ${
                                      cardData?.difficulty_level === option.value
                                        ? 'bg-gray-100 dark:bg-gray-700'
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                                  >
                                    <span className={`w-2 h-2 rounded-full mr-2 ${optionInfo.color.replace('text-', 'bg-')}`}></span>
                                    {option.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className={`inline-block px-2.5 py-0.5 text-xs rounded ${difficultyInfo.color}`}>
                          {difficultyInfo.name}
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Created Info */}
                  <div>
                    <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">Created</h4>
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {cardData?.created_at && format(new Date(cardData.created_at), 'MMM d, yyyy')}
                      {cardData?.created_by_username && (
                        <span className="block text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                          by {cardData.created_by_username}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Labels */}
                  <LabelDisplay
                    cardData={cardData}
                    boardId={cardData?.board_id}
                    canModify={canModify}
                    onUpdate={(updatedCard) => {
                      setCardData(updatedCard);
                      if (onUpdate) {
                        onUpdate(updatedCard);
                      }

                    }}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* CoverImagePicker Modal */}
      <CoverImagePicker
        isOpen={showCoverPicker}
        onClose={() => setShowCoverPicker(false)}
        currentCover={cardData?.cover_img ? {
          type: cardData.cover_img.startsWith('#') ? 'color' : 'image',
          value: cardData.cover_img
        } : null}
        onCoverSelect={handleCoverSelect}
      />

      {/* Attachment Upload Modal */}
      <AttachmentUploadModal
        isOpen={showAttachmentUpload}
        onClose={() => setShowAttachmentUpload(false)}
        onUpload={processFileUpload}
        uploadingAttachment={uploadingAttachment}
      />
    </div>
  );
};

export default CardDetail;
