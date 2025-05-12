import React, { useState, useEffect, useRef } from 'react'
import { Container, Draggable } from 'react-smooth-dnd'
import { FiPlus, FiMoreHorizontal, FiEdit2, FiTrash2, FiX } from 'react-icons/fi'
import { useParams } from 'react-router-dom'
import { createEditableProps } from '../../utils/contentEditable'
import Card from '../Card/Card'
import CardDetail from '../Card/CardDetail'
import api, { createCard } from '../../services/api'

const Column = ({ column, onCardDrop, onUpdateColumnState, onAddCard,  canModify = true, boardMembers = [] }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [columnTitle, setColumnTitle] = useState(column.title)
  const [showMenu, setShowMenu] = useState(false)
  const [selectedCard, setSelectedCard] = useState(null)
  const [showCardDetail, setShowCardDetail] = useState(false)
  const [boardMembersList, setBoardMembersList] = useState(boardMembers)
  const [showAddCard, setShowAddCard] = useState(false)
  const [newCardTitle, setNewCardTitle] = useState('')
  const [isAddingCard, setIsAddingCard] = useState(false)

  const menuRef = useRef(null)
  const addCardFormRef = useRef(null)
  const newCardInputRef = useRef(null)
  const { boardId } = useParams()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }

      if (showAddCard && addCardFormRef.current && !addCardFormRef.current.contains(event.target)) {
        handleCancelAddCard()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAddCard])

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

  const handleColumnTitleChange = (e) => {
    setColumnTitle(e.target.value)
  }

  const handleColumnTitleSubmit = () => {
    if (!canModify) return

    if (columnTitle.trim()) {
      onUpdateColumnState({
        ...column,
        title: columnTitle.trim()
      })
    } else {
      setColumnTitle(column.title)
    }
    setIsEditing(false)
  }

  const handleColumnTitleCancel = () => {
    setColumnTitle(column.title)
    setIsEditing(false)
  }

  const handleAddCard = () => {
    if (!canModify) return
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
      // Gọi API createCard 
      const response = await createCard({
        column_id: column.id,
        title: newCardTitle.trim()

      });
      
      // Update local state
      const newCard = response.card;
      
      onAddCard(newCard);
      // Reset form
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
    if (!canModify) return
    console.log('Delete column:', column.id)
  }

  const handleCardClick = (card) => {
    setSelectedCard(card)
    setShowCardDetail(true)
  }

  const handleCardUpdate = (updatedCard, isDeleted = false) => {
    if (isDeleted) {
      const updatedCards = column.cards.filter((c) => c.id !== selectedCard.id)
      onUpdateColumnState({
        ...column,
        cards: updatedCards
      })
    } else {
      const updatedCards = column.cards.map((c) =>
        c.id === updatedCard.id ? { ...c, ...updatedCard } : c
      )
      onUpdateColumnState({
        ...column,
        cards: updatedCards
      })
    }
  }

  const onDrop = (dropResult) => {
    if (onCardDrop && canModify) {
      onCardDrop(column.id, dropResult)
    }
  }

  const editableProps = createEditableProps(
    columnTitle,
    handleColumnTitleChange,
    handleColumnTitleSubmit,
    handleColumnTitleCancel
  )

  return (
    <>
      <div className="flex flex-col w-72 bg-gray-100/80 dark:bg-gray-800/80 rounded-lg shadow-sm mx-2 h-full">
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          {isEditing && canModify ? (
            <input {...editableProps} />
          ) : (
            <h3
              className={`text-sm font-medium text-gray-700 dark:text-gray-200 w-full py-1 px-1 rounded ${
                canModify ? 'cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-700/50' : ''
              }`}
              onClick={() => canModify && setIsEditing(true)}
            >
              {column.title}
            </h3>
          )}

          {canModify && (
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

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-2" style={{ maxHeight: 'calc(100vh - 160px)' }}>
        
          {column.cards && column.cards.length > 0 ? (
            <Container
              groupName="columns"
              onDrop={onDrop}
              getChildPayload={(index) => column.cards[index]}
              dragClass="card-ghost"
              dropClass="card-ghost-drop"
              dropPlaceholder={{
                animationDuration: 150,
                showOnTop: true,
                className: 'card-drop-preview'
              }}
              className="p-2"
              dragHandleSelector={canModify ? null : '.non-draggable'}
            >
              {column.cards.map((card) => (
                <Draggable key={card.id}>
                  <Card card={card} canModify={canModify} onClick={handleCardClick} />
                </Draggable>
              ))}
            </Container>
          ) : !showAddCard ? (
            <div className="p-2 text-center text-xs text-gray-500 dark:text-gray-400">No cards yet</div>
          ) : null}

          {showAddCard && (
            <div className="p-2" ref={addCardFormRef}>
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

        {canModify && !showAddCard && (
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
          canModify={canModify}
        />
      )}
    </>
  )
}

export default Column