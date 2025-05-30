import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { FiPlus, FiLock } from 'react-icons/fi';
import Column from '../Column/Column';
import { toast } from 'react-toastify';
import { createColumn, updateColumn, updateCard, deleteColumn } from '../../services/api';
import { emitBoardChange } from '../../services/socket';

const BoardContent = ({ board, socketRef }) => {
    const [columns, setColumns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddColumn, setShowAddColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');

    // Check if user has permission to modify the board
    const canModify = board && board.user_role && board.user_role !== "";

    // Use columns from board prop directly
    useEffect(() => {
        if (!board) return;
        
        try {
            // Sử dụng columns từ board prop trực tiếp
            if (board.columns) {
                // Make sure every column has a cards array
                const columnsWithCards = board.columns.map(column => ({
                    ...column,
                    cards: column.cards || []
                }));
                setColumns(columnsWithCards);
            } else {
                // Fallback nếu board.columns không tồn tại
                setColumns([]);
            }
            setIsLoading(false);
        } catch (err) {
            setError('Failed to process board columns');
            setIsLoading(false);
        }
    }, [board]);

    // Xử lý drag end cho cả column và card
    const onDragEnd = (result) => {
        if (!canModify) {
            toast.warning('Bạn không có quyền cập nhật bảng này');
            return;
        }
        console.log('Drag result:', result);
        const { source, destination, type } = result;

        // Dropped outside the list
        if (!destination) {
            return;
        }

        // Nếu không có sự thay đổi vị trí
        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        // Handle column reordering
        if (type === 'COLUMN') {
            const newColumns = [...columns];
            const [movedColumn] = newColumns.splice(source.index, 1);
            newColumns.splice(destination.index, 0, movedColumn);
            
            // Update positions
            const updatedColumns = newColumns.map((column, index) => ({
                ...column,
                position: index
            }));
            
            setColumns(updatedColumns);
            
            updateColumn(movedColumn.id, { position: destination.index })
                .then(() => {
                    emitBoardChange(board.id, 'column_order', updatedColumns);
                })
                .catch(err => {
                    console.error('Failed to update column position:', err);
                    setColumns(columns);
                });
            
            return;
        }

        // Handle card reordering
        if (type === 'CARD') {
            const newColumns = [...columns];
            
            // Extract column IDs from droppableId correctly
            const sourceColumnId = parseInt(source.droppableId.replace('column-', ''));
            const destColumnId = parseInt(destination.droppableId.replace('column-', ''));
            
            // Find source and destination columns
            const sourceColumnIndex = newColumns.findIndex(col => col.id === sourceColumnId);
            const destColumnIndex = newColumns.findIndex(col => col.id === destColumnId);
            
            if (sourceColumnIndex === -1 || destColumnIndex === -1) {
                console.error('Column not found:', { sourceColumnId, destColumnId });
                return;
            }
            
            const sourceColumn = newColumns[sourceColumnIndex];
            const destColumn = newColumns[destColumnIndex];
            
            // Use deep copy to avoid reference issues
            const cardToMove = JSON.parse(JSON.stringify(sourceColumn.cards[source.index]));
            

            // Remove from source
            sourceColumn.cards.splice(source.index, 1);
            
            // Add to destination
            destColumn.cards.splice(destination.index, 0, cardToMove);
            
            // Update card's column_id if it's a different column
            if (sourceColumnId !== destColumnId) {
                cardToMove.column_id = destColumnId;
            }
            
            // Update positions for all cards in affected columns
            sourceColumn.cards = sourceColumn.cards.map((card, idx) => ({
                ...card,
                position: idx
            }));
            
            if (sourceColumnId !== destColumnId) {
                destColumn.cards = destColumn.cards.map((card, idx) => ({
                    ...card,
                    position: idx
                }));
            }
            
            // Update state immediately for better UX
            setColumns([...newColumns]);
            
            // Then update backend
            updateCard(cardToMove.id, {
                position: destination.index,
                column_id: destColumnId
            })
            .then(() => {
                emitBoardChange(board.id, 'card_move', {
                    sourceColumnId: sourceColumnId,
                    destinationColumnId: destColumnId,
                    newColumns: newColumns
                });
            })
            .catch(err => {
                console.error('Failed to update card position:', err);
                // Consider not reverting UI to avoid jarring experience
            });
        }
    };

    // Handle column update
    const handleColumnUpdate = (updatedColumn) => {
        if (!canModify) {
            toast.warning('Bạn không có quyền cập nhật bảng này');
            return;
        }

        const newColumns = columns.map(col =>
            col.id === updatedColumn.id ? updatedColumn : col
        );
        setColumns(newColumns);

        // Update column in backend
        updateColumn(updatedColumn.id, { title: updatedColumn.title })
            .then(() => {
                // Emit column update via socket for real-time sync
                emitBoardChange(board.id, 'column_update', updatedColumn);
            })
            .catch(err => {
                console.error('Failed to update column:', err);
                setColumns(columns);
            });
    };

    const handleAddCard = (card) => {
        if (!canModify) {
            toast.warning('Bạn không có quyền cập nhật bảng này');
            return;
        }

        console.log('Adding card:', card);
        const newColumns = columns.map(col => {
            if (col.id === card.column_id) {
                return {
                    ...col,
                    cards: [...col.cards, card]
                };
            }
            return col;
        });
        setColumns(newColumns);
        // Emit new card via socket for real-time sync
        emitBoardChange(board.id, 'card_created', card);
    };

    // Handle add new column
    const handleAddColumn = async () => {
        if (!canModify) {
            toast.warning('Bạn không có quyền cập nhật bảng này');
            return;
        }

        if (!newColumnTitle.trim()) {
            toast.error('Vui lòng nhập tên cột');
            return;
        }

        try {
            const response = await createColumn({
                title: newColumnTitle.trim(),
                board_id: board.id,
            });

            const newColumn = response.column;
            setColumns([...columns, newColumn]);
            setNewColumnTitle('');
            setShowAddColumn(false);
            
            // Emit new column via socket for real-time sync
            emitBoardChange(board.id, 'column_add', newColumn);
            
            toast.success('Đã thêm cột mới');
        } catch (err) {
            toast.error('Không thể thêm cột mới');
        }
    };

    const handleDeleteColumn = (columnId) => {
        const updatedColumns = columns.filter(col => col.id !== columnId);
        setColumns(updatedColumns);
        emitBoardChange(board.id, 'column_delete', columnId);
    }

    if (!board) {
        return null;
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                        {error}
                    </h3>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-full">
            {/* Board Content - Fixed height with horizontal scroll */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable 
                        droppableId="all-columns"
                        type="COLUMN" 
                        direction="horizontal"
                        isCombineEnabled={false}
                        isDropDisabled={false}
                        ignoreContainerClipping={false}
                    >
                        {(provided) => (
                            <div 
                                className="inline-flex min-w-full pb-4 h-full" 
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                            >
                                {columns && columns.length > 0 ? (
                                    columns.map((column, index) => (
                                        <Column
                                            key={`column-`+column.id || `temp-${index}`}
                                            index={index}
                                            column={column}
                                            canModify={Boolean(canModify)} // Thay vì !!canModify
                                            onUpdateColumnState={handleColumnUpdate}
                                            onAddCard={handleAddCard}
                                            onDeleteColumn={handleDeleteColumn}
                                            boardMembers={board.members || []}
                                            socketRef={socketRef}
                                        />
                                    ))
                                ) : (
                                    <div className="text-center p-4">No columns yet</div>
                                )}
                                {provided.placeholder}
                                
                                {/* Add Column Button - Only visible to members */}
                                {canModify && (
                                    <div className="w-72 shrink-0 h-auto ml-4">
                                        {showAddColumn ? (
                                            <div className="bg-gray-100/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 shadow-md">
                                                <input
                                                    type="text"
                                                    value={newColumnTitle}
                                                    onChange={(e) => setNewColumnTitle(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            handleAddColumn();
                                                        } else if (e.key === 'Escape') {
                                                            setShowAddColumn(false);
                                                            setNewColumnTitle('');
                                                        }
                                                    }}
                                                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    placeholder="Nhập tên cột..."
                                                    autoFocus
                                                />
                                                <div className="flex items-center mt-2 space-x-2">
                                                    <button
                                                        onClick={handleAddColumn}
                                                        className="px-3 py-1.5 text-sm text-white bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                                                    >
                                                        Add Column
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setShowAddColumn(false);
                                                            setNewColumnTitle('');
                                                        }}
                                                        className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setShowAddColumn(true)}
                                                className="w-full p-2.5 text-sm text-gray-600 dark:text-gray-400 bg-white/80 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center shadow-md"
                                            >
                                                <FiPlus className="w-4 h-4 mr-1" />
                                                Add Column
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    );
};

export default BoardContent;
