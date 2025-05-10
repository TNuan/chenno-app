import React, { useState, useEffect, useRef } from 'react'
import { Container, Draggable } from 'react-smooth-dnd'
import { FiPlus, FiMoreHorizontal, FiEdit2, FiTrash2 } from 'react-icons/fi'
import { useParams } from 'react-router-dom'
import { createEditableProps } from '../../utils/contentEditable'

const Column = ({ column, onCardDrop, onUpdateColumnState, canModify = true }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [columnTitle, setColumnTitle] = useState(column.title)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  const { boardId } = useParams()

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleColumnTitleChange = (e) => {
    setColumnTitle(e.target.value)
  }

  const handleColumnTitleSubmit = () => {
    if (!canModify) return;
    
    if (columnTitle.trim()) {
      onUpdateColumnState({
        ...column,
        title: columnTitle.trim()
      })
    } else {
      // If empty, revert to original title
      setColumnTitle(column.title)
    }
    setIsEditing(false)
  }

  const handleColumnTitleCancel = () => {
    setColumnTitle(column.title)
    setIsEditing(false)
  }

  const handleAddCard = () => {
    if (!canModify) return;
    
    // TODO: Implement add card functionality
    console.log('Add card to column:', column.id)
  }

  const handleDeleteColumn = () => {
    if (!canModify) return;
    
    // TODO: Implement delete column functionality
    console.log('Delete column:', column.id)
  }

  const onDrop = (dropResult) => {
    if (onCardDrop && canModify) {
      onCardDrop(column.id, dropResult)
    }
  }

  // Get editable props from utility function
  const editableProps = createEditableProps(
    columnTitle,
    handleColumnTitleChange,
    handleColumnTitleSubmit,
    handleColumnTitleCancel
  )

  return (
    <div className="flex flex-col w-72 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg shadow-sm mx-2 h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        {isEditing && canModify ? (
          <input {...editableProps} />
        ) : (
          <h3 
            className={`text-sm font-medium text-gray-700 dark:text-gray-200 w-full py-1 px-1 rounded ${canModify ? 'cursor-pointer hover:bg-gray-200/50 dark:hover:bg-gray-700/50' : ''}`}
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
      
      {/* Cards Container with vertical scroll */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ maxHeight: 'calc(100vh - 160px)' }}>
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
            dragHandleSelector={canModify ? null : ".non-draggable"}
          >
            {column.cards.map((card, index) => (
              <Draggable key={card.id}>
                <div className={`p-2 mb-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm ${canModify ? 'cursor-pointer' : ''} hover:shadow-md transition-shadow`}>
                  <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {card.title}
                  </h4>
                  {card.description && (
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {card.description}
                    </p>
                  )}
                </div>
              </Draggable>
            ))}
          </Container>
        ) : (
          <div className="p-2 text-center text-xs text-gray-500 dark:text-gray-400">
            No cards yet
          </div>
        )}
      </div>

      {/* Add Card Button - Only visible if user has permission */}
      {canModify && (
        <button
          onClick={handleAddCard}
          className="flex items-center justify-center p-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-b-lg transition-colors"
        >
          <FiPlus className="w-4 h-4 mr-1" />
          Add Card
        </button>
      )}
    </div>
  )
}

export default Column