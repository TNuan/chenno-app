import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiUser, FiClock, FiTag, FiPaperclip, FiMessageSquare, FiAlertCircle, FiCheck, FiChevronDown, FiImage } from 'react-icons/fi';
import { format } from 'date-fns';
import api from '../../services/api';
import { createEditableProps } from '../../utils/contentEditable';
import { useAlert } from '../../contexts/AlertContext';
import { emitBoardChange } from '../../services/socket';
import CoverImagePicker from './CoverImagePicker';

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
  const [editMode, setEditMode] = useState(false);
  const [editFields, setEditFields] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority_level: 0,
    difficulty_level: 0,
    due_date: '',
    assigned_to: null
  });

  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);

  const modalRef = useRef(null);
  const textareaRef = useRef(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const statusMenuRef = useRef(null);
  const { showConfirm } = useAlert();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Fetch card details when opened
  useEffect(() => {
    if (isOpen && card?.id) {
      fetchCardDetails(card.id);
    }
  }, [isOpen, card]);

  // Auto-adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editFields.description]);

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
        if (data.changeType === 'comment_added' && data.payload?.card_id === card.id) {
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
        }
      });

      // Cleanup function
      return () => {
        if (socketRef) {
          socketRef.off('board_updated');
          console.log(`Stopped listening for comments on card ${card.id}`);
        }
      };
    }
  }, [isOpen, card?.id, cardData?.board_id, socketRef]);

  const fetchCardDetails = async (cardId) => {
    setLoading(true);
    try {
      const response = await api.get(`/cards/details/${cardId}`);
      setCardData(response.data.card);

      // Initialize edit fields with current values
      setEditFields({
        title: response.data.card.title,
        description: response.data.card.description || '',
        status: response.data.card.status || 'todo',
        priority_level: response.data.card.priority_level || 0,
        difficulty_level: response.data.card.difficulty_level || 0,
        due_date: response.data.card.due_date ? new Date(response.data.card.due_date).toISOString().split('T')[0] : '',
        assigned_to: response.data.card.assigned_to || null
      });
    } catch (error) {
      console.error('Failed to fetch card details', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFields((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatusChange = (status) => {
    setEditFields((prev) => ({
      ...prev,
      status
    }));
  };

  const handlePriorityChange = (priority) => {
    setEditFields((prev) => ({
      ...prev,
      priority_level: parseInt(priority, 10)
    }));
  };

  const handleDifficultyChange = (difficulty) => {
    setEditFields((prev) => ({
      ...prev,
      difficulty_level: parseInt(difficulty, 10)
    }));
  };

  const handleAssigneeChange = (userId) => {
    setEditFields((prev) => ({
      ...prev,
      assigned_to: userId === 'none' ? null : parseInt(userId, 10)
    }));
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

      // Cập nhật cardData với comment mới
      setCardData(prevData => ({
        ...prevData,
        comments: [
          ...(prevData.comments || []),
          response.data.comment
        ]
      }));

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

  const handleSave = async () => {
    setLoading(true);
    try {
      // Get the required fields from editFields
      const updatedCard = {
        title: editFields.title,
        description: editFields.description,
        status: editFields.status,
        priority_level: editFields.priority_level,
        difficulty_level: editFields.difficulty_level,
        due_date: editFields.due_date ? new Date(editFields.due_date).toISOString() : null,
        assigned_to: editFields.assigned_to
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

      setEditMode(false);
    } catch (error) {
      console.error('Failed to update card', error);
    } finally {
      setLoading(false);
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
    if (editMode) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        setEditMode(false);
        onClose();
      }
    } else {
      onClose();
    }
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

      // Cập nhật editFields nếu đang trong edit mode
      if (editMode) {
        setEditFields(prev => ({
          ...prev,
          status
        }));
      }

      // Notify parent component
      if (onUpdate) {
        onUpdate(response.data.card);
      }

      // Emit socket event for real-time updates
      // const socket = getSocket();
      // if (socket) {
      //   socket.emit('board_change', {
      //     type: 'card_updated',
      //     boardId: cardData.board_id,
      //     data: response.data.card
      //   });
      // }
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
        cover_img: coverData ? coverData.value : null // Lưu trực tiếp value (URL hoặc màu)
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
      console.error('Failed to update card cover', error);
    } finally {
      setLoading(false);
    }
  };

  const renderModalCoverImage = () => {
    if (!cardData?.cover_img) return null;

    // Kiểm tra xem cover_img là URL ảnh hay mã màu
    const isImageUrl = cardData.cover_img.startsWith('http') || cardData.cover_img.startsWith('/static') || cardData.cover_img.startsWith('data:');
    const isColorCode = cardData.cover_img.startsWith('#');

    if (isImageUrl) {
      return (
        <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
          <img
            src={cardData.cover_img}
            alt="Card cover"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <div 
            className="hidden w-full h-full bg-gradient-to-br from-blue-400 to-purple-500"
          />
          {canModify && (
            <button
              onClick={() => setShowCoverPicker(true)}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded text-xs transition-colors"
              title="Change cover"
            >
              <FiImage className="w-3 h-3" />
            </button>
          )}
        </div>
      );
    } else if (isColorCode) {
      return (
        <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
          <div 
            className="w-full h-full"
            style={{ backgroundColor: cardData.cover_img }}
          />
          {canModify && (
            <button
              onClick={() => setShowCoverPicker(true)}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded text-xs transition-colors"
              title="Change cover"
            >
              <FiImage className="w-3 h-3" />
            </button>
          )}
        </div>
      );
    }

    return null;
  };

  const renderAddCoverButton = () => {
    if (cardData?.cover_img || !canModify) return null;

    return (
      <div className="mb-4">
        <button
          onClick={() => setShowCoverPicker(true)}
          className="w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <FiImage className="w-8 h-8 mb-2" />
          <span className="text-sm font-medium">Add Cover Image</span>
          <span className="text-xs">Choose from images or colors</span>
        </button>
      </div>
    );
  };

  const editableProps = createEditableProps(
    cardTitle,
    handleCardTitleChange,
    handleCardTitleSubmit,
    handleCardTitleCancel
  );

  if (!isOpen || !card) return null;

  const statusInfo = getStatusInfo(cardData?.status || 'todo');
  const priorityInfo = getPriorityInfo(cardData?.priority_level || 0);
  const difficultyInfo = getDifficultyInfo(cardData?.difficulty_level || 0);

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onMouseDown={(e) => {
        // Ngăn chặn event bubbling lên các phần tử cha
        e.stopPropagation();
      }}
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onMouseDown={(e) => {
          // Ngăn chặn event bubbling và đảm bảo sự kiện không truyền ra ngoài modal
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center flex-1">
            {/* Status Badge với Dropdown */}
            <div className="relative mr-2" ref={statusMenuRef}>
              <button
                onClick={() => canModify && setIsStatusMenuOpen(!isStatusMenuOpen)}
                className={`h-6 px-2.5 py-0.5 text-xs text-white rounded flex items-center ${statusInfo.color} ${canModify ? 'hover:brightness-110 cursor-pointer' : 'cursor-default'}`}
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
                className="flex-1 px-2 py-1 text-base font-medium text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <h2
                className={`text-lg font-medium text-gray-800 dark:text-gray-200 px-2 py-1 flex-1 ${canModify ? 'cursor-pointer rounded hover:bg-gray-100 dark:hover:bg-gray-700' : ''}`}
                onClick={() => canModify && setIsEditingTitle(true)}
                title={canModify ? "Click to edit card title" : ""}
              >
                {loading && !cardData ? 'Loading...' : cardData?.title || card.title}
              </h2>
            )}
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <FiX className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
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
                {/* Cover Image Section - Thêm phần này */}
                {renderModalCoverImage()}
                {renderAddCoverButton()}

                {editMode ? (
                  <>
                    {/* Title input */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={editFields.title}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        placeholder="Card title"
                      />
                    </div>

                    {/* Description textarea */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        ref={textareaRef}
                        name="description"
                        value={editFields.description}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 min-h-[120px]"
                        placeholder="Add a more detailed description..."
                        rows={4}
                      />
                    </div>

                    {/* Status selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Status
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {statusOptions.map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleStatusChange(option.value)}
                            className={`px-3 py-1.5 rounded-md text-sm ${editFields.status === option.value
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-2 border-blue-500'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600'
                              }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Card title */}
                    <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      {cardData?.title}
                    </h1>

                    {/* Description */}
                    <div className="mb-6 dark:bg-gray-800 rounded-md">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center">
                        <FiAlertCircle className="mr-1" /> Description
                      </h3>
                      <div className="p-3 bg-gray-50 dark:bg-gray-750 rounded-md text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                        {cardData?.description || <span className="text-gray-400 italic">No description provided</span>}
                      </div>
                    </div>
                  </>
                )}

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
                {editMode ? (
                  <>
                    {/* Cover Image Button trong Edit Mode */}
                    {canModify && (
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Cover Image
                        </label>
                        <button
                          onClick={() => setShowCoverPicker(true)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm flex items-center justify-center"
                        >
                          <FiImage className="w-4 h-4 mr-2" />
                          {cardData?.cover_img ? 'Change Cover' : 'Add Cover'}
                        </button>
                      </div>
                    )}

                    {/* Các phần khác trong edit mode - giữ nguyên */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Due Date
                      </label>
                      <input
                        type="date"
                        name="due_date"
                        value={editFields.due_date}
                        onChange={handleInputChange}
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      />
                    </div>

                    {/* Assignee selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Assignee
                      </label>
                      <select
                        className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        value={editFields.assigned_to || 'none'}
                        onChange={(e) => handleAssigneeChange(e.target.value)}
                      >
                        <option value="none">None</option>
                        {boardMembers.map(member => (
                          <option key={member.id} value={member.id}>
                            {member.username || member.email}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Priority selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Priority
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {priorityOptions.map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handlePriorityChange(option.value)}
                            className={`px-3 py-1.5 rounded-md text-sm ${editFields.priority_level === option.value
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-2 border-blue-500'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600'
                              }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Difficulty selection */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Difficulty
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {difficultyOptions.map(option => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => handleDifficultyChange(option.value)}
                            className={`px-3 py-1.5 rounded-md text-sm ${editFields.difficulty_level === option.value
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-2 border-blue-500'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600'
                              }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Actions Section - Thêm phần này vào đầu sidebar */}
                    {canModify && (
                      <div className="mb-6">
                        <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-2">Actions</h4>
                        <div className="space-y-2">
                          <button
                            onClick={() => setShowCoverPicker(true)}
                            className="w-full px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center"
                          >
                            <FiImage className="w-4 h-4 mr-2" />
                            {cardData?.cover_image ? 'Change Cover' : 'Add Cover'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Metadata display - giữ nguyên các phần hiện có */}
                    <div className="space-y-4">
                      {/* Status */}
                      <div>
                        <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">Status</h4>
                        <div className={`${statusInfo.color} inline-block px-2.5 py-0.5 text-xs text-white rounded`}>
                          {statusInfo.name}
                        </div>
                      </div>

                      {/* Assignee */}
                      <div>
                        <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">Assignee</h4>
                        {cardData?.assigned_to ? (
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
                        )}
                      </div>

                      {/* Due Date */}
                      <div>
                        <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">Due Date</h4>
                        {cardData?.due_date ? (
                          <div className="flex items-center text-sm">
                            <FiClock className="mr-1 text-gray-500 dark:text-gray-400" />
                            <span className="text-gray-800 dark:text-gray-200">
                              {format(new Date(cardData.due_date), 'MMM d, yyyy')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">None</span>
                        )}
                      </div>

                      {/* Priority */}
                      <div>
                        <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">Priority</h4>
                        <div className={`inline-block px-2.5 py-0.5 text-xs rounded ${priorityInfo.color}`}>
                          {priorityInfo.name}
                        </div>
                      </div>

                      {/* Difficulty */}
                      <div>
                        <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">Difficulty</h4>
                        <div className={`inline-block px-2.5 py-0.5 text-xs rounded ${difficultyInfo.color}`}>
                          {difficultyInfo.name}
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

                      {/* Attachments */}
                      {cardData?.attachments && cardData.attachments.length > 0 && (
                        <div>
                          <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">
                            Attachments ({cardData.attachments.length})
                          </h4>
                          <div className="text-sm text-blue-600 dark:text-blue-400">
                            <a href="#" className="hover:underline flex items-center">
                              <FiPaperclip className="mr-1" /> View attachments
                            </a>
                          </div>
                        </div>
                      )}

                      {/* Labels */}
                      {cardData?.labels && cardData.labels.length > 0 && (
                        <div>
                          <h4 className="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium mb-1">
                            Labels
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {cardData.labels.map(label => (
                              <span
                                key={label.id}
                                className="px-2 py-0.5 text-xs rounded-full"
                                style={{ backgroundColor: label.color, color: '#fff' }}
                              >
                                {label.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Footer action buttons - giữ nguyên */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex justify-between">
              {editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'} <FiCheck className="ml-1" />
                  </button>
                </>
              ) : (
                <>
                  {canModify && (
                    <>
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      >
                        Delete Card
                      </button>
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Edit Card
                      </button>
                    </>
                  )}
                </>
              )}
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
    </div>
  );
};

export default CardDetail;