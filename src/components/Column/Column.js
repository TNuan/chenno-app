import React, { useState, useEffect, useRef } from 'react'
import { Droppable, Draggable } from 'react-beautiful-dnd'
import { FiPlus, FiMoreHorizontal, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import { useParams } from 'react-router-dom'
import { createEditableProps } from '../../utils/contentEditable'
import Card from '../Card/Card'
import CardDetail from '../Card/CardDetail'
import api, { createCard, deleteColumn, updateColumn } from '../../services/api';
import { useAlert } from '../../contexts/AlertContext' // Thêm import này
import { toast } from 'react-toastify' // Nếu bạn đang sử dụng toast để thông báo

const Column = ({ column, index, onUpdateColumnState, onAddCard, onDeleteColumn, canModify = true, boardMembers = [], socketRef}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [columnTitle, setColumnTitle] = useState(column?.title || '')
  const [showMenu, setShowMenu] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [showCardDetail, setShowCardDetail] = useState(false)
  const [boardMembersList, setBoardMembersList] = useState(boardMembers || [])
  const [showAddCard, setShowAddCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [isAddingCard, setIsAddingCard] = useState(false)

  const menuRef = useRef(null)
  const addCardFormRef = useRef(null)
  const newCardInputRef = useRef(null)
  const { boardId } = useParams()

  const columnId = column && column.id ? `column-${column.id.toString()}` : `column-placeholder-${index}`
  const canModifyBoolean = Boolean(canModify)
  const cards = column?.cards || []

  const { showConfirm } = useAlert();

  useEffect(() => {
    if (showAddCard && newCardInputRef.current) {
      newCardInputRef.current.focus()
    }
  }, [showAddCard])

  useEffect(() => {
    if (boardMembers.length === 0 && boardId) {
      const fetchBoardMembers = async () => {
        try {
          const response = await api.get(`/boards/${boardId}/members`)
          setBoardMembersList(response.data.members)
        } catch (error) {
          console.error('Failed to fetch board members', error)
        }
      }
      fetchBoardMembers()
    } else {
      setBoardMembersList(boardMembers)
    }
  }, [boardId, boardMembers])

  useEffect(() => {
    if (column && column.cards) {
      // Sắp xếp cards theo position để đảm bảo thứ tự đúng
      const sortedCards = [...column.cards].sort((a, b) => 
        (a.position !== undefined ? a.position : 0) - (b.position !== undefined ? b.position : 0)
      );
      
      if (JSON.stringify(sortedCards) !== JSON.stringify(column.cards)) {
        // Nếu thứ tự khác, cập nhật column với cards đã sắp xếp
        onUpdateColumnState({
          ...column,
          cards: sortedCards
        });
      }
    }
  }, [column]);

  const handleColumnTitleChange = (e) => {
    setColumnTitle(e.target.value)
  }

  const handleColumnTitleSubmit = async () => {
    if (!canModifyBoolean) return;

    if (!columnTitle.trim()) {
        setColumnTitle(column.title);
        setIsEditing(false);
        return;
    }

    // Nếu title không thay đổi thì không cần gọi API
    if (columnTitle.trim() === column.title) {
        setIsEditing(false);
        return;
    }

    try {
        setIsEditing(false); // Đóng edit mode ngay lập tức để UX mượt hơn
        
        // Gọi API update column trước
        await updateColumn(column.id, { title: columnTitle.trim() });
        
        // Sau đó mới update state local
        onUpdateColumnState({
            ...column,
            title: columnTitle.trim()
        });
        
        // Socket event sẽ được emit từ backend, không cần emit ở đây
        
    } catch (error) {
        console.error('Failed to update column title:', error);
        
        // Nếu API thất bại, revert lại title cũ
        setColumnTitle(column.title);
        toast.error('Không thể cập nhật tên cột. Vui lòng thử lại.');
        
        // Có thể mở lại edit mode nếu muốn
        // setIsEditing(true);
    }
  }

  const handleColumnTitleCancel = () => {
    setColumnTitle(column.title)
    setIsEditing(false)
  }

  const handleAddCard = () => {
    if (!canModifyBoolean) return
    setShowAddCard(true)
  }

  const handleNewCardTitleChange = (e) => {
    setNewCardTitle(e.target.value)
  }

  const handleCancelAddCard = () => {
    setShowAddCard(false)
    setNewCardTitle('')
  }

  const handleCardKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmitNewCard()
    } else if (e.key === 'Escape') {
      handleCancelAddCard()
    }
  }

  const handleSubmitNewCard = async () => {
    if (!newCardTitle.trim() || isAddingCard) return;
    
    setIsAddingCard(true);
    
    try {
      const response = await createCard({
        column_id: column.id,
        title: newCardTitle.trim()
      });
      
      const newCard = response.card;
      
      onAddCard(newCard);
      setNewCardTitle('');
      setShowAddCard(false);
    } catch (error) {
      console.error('Failed to create card:', error);
      alert('Failed to create card. Please try again.');
    } finally {
      setIsAddingCard(false);
    }
  }

  const handleDeleteColumn = () => {
    if (!canModifyBoolean) return;
    
    const hasCards = cards.length > 0;
    const message = hasCards 
      ? `Bạn có chắc chắn muốn xóa cột "${column.title}" và tất cả ${cards.length} thẻ bên trong không? Hành động này không thể hoàn tác.`
      : `Bạn có chắc chắn muốn xóa cột "${column.title}" không? Hành động này không thể hoàn tác.`;
    
    showConfirm(
      'Xóa cột', 
      message, 
      async () => {
        try {
          await deleteColumn(column.id);
          onDeleteColumn(column.id);
          toast.success('Cột đã được xóa thành công.');
        } catch (error) {
          console.error('Failed to delete column:', error);
          toast.error('Xóa cột thất bại. Vui lòng thử lại.');
        }
      }
    );
  };

  const handleCardClick = (card) => {
    setSelectedCard(card)
    setShowCardDetail(true)
  }

  const handleCardUpdate = (updatedCard, isDeleted = false) => {
    if (isDeleted) {
      const updatedCards = cards.filter((c) => c.id !== selectedCard.id)
      onUpdateColumnState({
        ...column,
        cards: updatedCards
      })
    } else {
      const updatedCards = cards.map((c) =>
        c.id === updatedCard.id ? { ...c, ...updatedCard } : c
      )
      onUpdateColumnState({
        ...column,
        cards: updatedCards
      })
    }
  }

  const editableProps = createEditableProps(
    columnTitle,
    handleColumnTitleChange,
    handleColumnTitleSubmit,
    handleColumnTitleCancel
  )

  return (
    <Draggable 
      draggableId={columnId} 
      index={index}
      isDragDisabled={!canModifyBoolean}
    >
      {(provided, snapshot) => (
        <div
          className="mx-2"
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div className="flex flex-col w-72 bg-gray-100/80 dark:bg-gray-800/80 rounded-lg shadow-sm h-max-full">
            <div 
              className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700"
              {...provided.dragHandleProps}
            >
              {isEditing && canModifyBoolean ? (
                <input {...editableProps} />
              ) : (
                <h3
                  className={`text-sm font-medium text-gray-700 dark:text-gray-200 w-full py-1 px-1 rounded ${
                    canModifyBoolean ? 'cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-700/50' : ''
                  }`}
                  onClick={() => canModifyBoolean && setIsEditing(true)}
                >
                  {column.title}
                </h3>
              )}

              {canModifyBoolean && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleAddCard}
                    className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <FiPlus className="w-4 h-4" />
                  </button>

                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <FiMoreHorizontal className="w-4 h-4" />
                    </button>

                    {showMenu && (
                      <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                        <button
                          onClick={() => {
                            setIsEditing(true)
                            setShowMenu(false)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <FiEdit2 className="w-4 h-4 mr-2" />
                          Edit Column
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteColumn()
                            setShowMenu(false)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <FiTrash2 className="w-4 h-4 mr-2" />
                          Delete Column
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Droppable 
              droppableId={columnId}
              type="CARD"
              isDropDisabled={canModifyBoolean === false}
              isCombineEnabled={false}
              ignoreContainerClipping={false}
              direction="vertical"
            >
              {(provided, snapshot) => (
                <div 
                  className={`flex flex-col overflow-y-auto overflow-x-hidden p-2 min-h-[100px] ${
                    snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{ maxHeight: 'calc(100vh - 160px)' }}
                >
                  {cards.length > 0 ? (
                    cards.map((card, index) => (
                      <Card 
                        key={card.id || `temp-${index}`}
                        card={card}
                        index={index}
                        canModify={canModifyBoolean}
                        onClick={handleCardClick}
                      />
                    ))
                  ) : (
                    !showAddCard && (
                      <div className="text-center text-xs text-gray-500 dark:text-gray-400 py-4">
                        No cards yet
                      </div>
                    )
                  )}
                  {provided.placeholder}

                  {showAddCard && (
                    <div className="py-2" ref={addCardFormRef}>
                      <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-2 border border-blue-200 dark:border-blue-800">
                        <textarea
                          ref={newCardInputRef}
                          value={newCardTitle}
                          onChange={handleNewCardTitleChange}
                          onKeyDown={handleCardKeyDown}
                          placeholder="Enter a title for this card..."
                          className="w-full p-2 text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          disabled={isAddingCard}
                        />
                        <div className="flex items-center justify-between mt-2">
                          <button
                            onClick={handleSubmitNewCard}
                            disabled={!newCardTitle.trim() || isAddingCard}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isAddingCard ? 'Adding...' : 'Add Card'}
                          </button>
                          <button
                            onClick={handleCancelAddCard}
                            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </Droppable>

            {canModifyBoolean && !showAddCard && (
              <button
                onClick={handleAddCard}
                className="flex items-center justify-center p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-b-lg transition-colors"
              >
                <FiPlus className="w-4 h-4 mr-1" />
                Add Card
              </button>
            )}
          </div>

          {showCardDetail && selectedCard && (
            <CardDetail
              card={selectedCard}
              isOpen={showCardDetail}
              onClose={() => setShowCardDetail(false)}
              onUpdate={handleCardUpdate}
              boardMembers={boardMembersList}
              canModify={canModifyBoolean}
              socketRef={socketRef}
            />
          )}
        </div>
      )}
    </Draggable>
  )
}

export default Column;