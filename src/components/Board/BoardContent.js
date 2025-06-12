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

    // Setup socket listeners for columns and cards
    useEffect(() => {
        if (!socketRef || !board?.id) return;

        const handleBoardUpdate = (data) => {
            console.log('BoardContent received board update:', data);
            
            // Chỉ xử lý events liên quan đến board hiện tại
            if (data.boardId != board.id) return;

            switch (data.changeType) {
                case 'column_order':
                    console.log('Updating column order:', data.payload);
                    setColumns(data.payload);
                    break;

                case 'column_add':
                    console.log('Adding new column:', data.payload);
                    setColumns(prevColumns => [
                        ...prevColumns,
                        {
                            ...data.payload,
                            cards: data.payload.cards || []
                        }
                    ]);
                    break;

                case 'column_update':
                    console.log('Updating column:', data.payload);
                    setColumns(prevColumns => 
                        prevColumns.map(col => 
                            col.id === data.payload.id ? data.payload : col
                        )
                    );
                    break;

                case 'column_delete':
                    console.log('Deleting column:', data.payload);
                    setColumns(prevColumns => 
                        prevColumns.filter(col => col.id !== data.payload)
                    );
                    break;

                case 'card_created':
                    console.log('New card created:', data.payload);
                    setColumns(prevColumns => 
                        prevColumns.map(col => {
                            if (col.id === data.payload.column_id) {
                                return {
                                    ...col,
                                    cards: [...(col.cards || []), data.payload]
                                };
                            }
                            return col;
                        })
                    );
                    break;

                case 'card_move':
                    console.log('Moving card:', data.payload);
                    const { sourceColumnId, destinationColumnId, newColumns } = data.payload;
                    setColumns(newColumns);
                    break;

                case 'card_updated':
                    console.log('Card updated:', data.payload);
                    setColumns(prevColumns => 
                        prevColumns.map(col => ({
                            ...col,
                            cards: col.cards.map(card => {
                                if (card.id === data.payload.id) {
                                    return {
                                        ...card,
                                        ...(data.payload.title !== undefined && { title: data.payload.title }),
                                        ...(data.payload.assigned_to !== undefined && { assigned_to: data.payload.assigned_to }),
                                        ...(data.payload.due_date !== undefined && { due_date: data.payload.due_date }),
                                        ...(data.payload.cover_img !== undefined && { cover_img: data.payload.cover_img })
                                    };
                                }
                                return card;
                            })
                        }))
                    );
                    break;

                case 'card_remove':
                    console.log('Card removed:', data.payload);
                    setColumns(prevColumns => 
                        prevColumns.map(col => {
                            if (col.id === data.payload.column_id) {
                                return {
                                    ...col,
                                    cards: col.cards.filter(card => card.id !== data.payload.card_id)
                                };
                            }
                            return col;
                        })
                    );
                    break;

                case 'card_archived':
                    console.log('Card archived:', data.payload);
                    setColumns(prevColumns => 
                        prevColumns.map(col => {
                            if (col.id === data.payload.column_id) {
                                return {
                                    ...col,
                                    cards: col.cards.filter(card => card.id !== data.payload.card_id)
                            };
                        }
                        return col;
                    })
                );
                break;

                case 'card_unarchived':
                    console.log('Card unarchived:', data.payload);
                    setColumns(prevColumns => 
                        prevColumns.map(col => {
                            if (col.id === data.payload.column_id) {
                                return {
                                    ...col,
                                    cards: [...(col.cards || []), data.payload]
                            };
                        }
                        return col;
                    })
                );
                break;

                case 'comment_added':
                    console.log('Comment added to card:', data.payload);
                    setColumns(prevColumns => 
                        prevColumns.map(col => ({
                            ...col,
                            cards: col.cards.map(card => {
                                if (card.id === data.payload.card_id) {
                                    return {
                                        ...card,
                                        comment_count: (card.comment_count || 0) + 1
                                    };
                                }
                                return card;
                            })
                        }))
                    );
                    break;

                case 'attachment_added':
                    console.log('Attachment added to card:', data.payload);
                    setColumns(prevColumns =>
                        prevColumns.map(col => ({
                            ...col,
                            cards: col.cards.map(card => {
                                if (card.id === data.payload.card_id) {
                                    return {
                                        ...card,
                                        attachment_count: (card.attachment_count || 0) + 1
                                    };
                                }
                                return card;
                            })
                        }))
                    );
                    break;
                case 'attachment_removed':
                    console.log('Attachment removed from card:', data.payload);
                    setColumns(prevColumns =>
                        prevColumns.map(col => ({
                            ...col,
                            cards: col.cards.map(card => {
                                if (card.id === data.payload.card_id) {
                                    return {
                                        ...card,
                                        attachment_count: Math.max((card.attachment_count || 0) - 1, 0)
                                    };
                                }
                                return card;
                            })
                        }))
                    );
                    break;

                // Thêm xử lý cho label events
                case 'label_added_to_card':
                    console.log('Label added to card:', data.payload);
                    setColumns(prevColumns => 
                        prevColumns.map(col => ({
                            ...col,
                            cards: col.cards.map(card => {
                                if (card.id === data.payload.card_id) {
                                    // Thêm label vào card nếu chưa có
                                    const existingLabelIds = (card.labels || []).map(l => l.id);
                                    if (!existingLabelIds.includes(data.payload.label.id)) {
                                        return {
                                            ...card,
                                            labels: [
                                                ...(card.labels || []),
                                                {
                                                    id: data.payload.label.id,
                                                    name: data.payload.label.name,
                                                    color: data.payload.label.color
                                                }
                                            ]
                                        };
                                    }
                                }
                                return card;
                            })
                        }))
                    );
                    break;

                case 'label_removed_from_card':
                    console.log('Label removed from card:', data.payload);
                    setColumns(prevColumns => 
                        prevColumns.map(col => ({
                            ...col,
                            cards: col.cards.map(card => {
                                if (card.id == data.payload.card_id) {
                                    return {
                                        ...card,
                                        labels: (card.labels || []).filter(label => 
                                            label.id != data.payload.label_id
                                        )
                                    };
                                }
                                return card;
                            })
                        }))
                    );
                    break;

                case 'label_created':
                    console.log('Label created:', data.payload);
                    // Label mới được tạo, có thể cần refresh board labels nếu cần
                    break;

                case 'label_updated':
                    console.log('Label updated:', data.payload);
                    // Cập nhật label trong tất cả cards sử dụng label này
                    setColumns(prevColumns => 
                        prevColumns.map(col => ({
                            ...col,
                            cards: col.cards.map(card => ({
                                ...card,
                                labels: (card.labels || []).map(label => 
                                    label.id === data.payload.id 
                                        ? { ...label, ...data.payload }
                                        : label
                                )
                            }))
                        }))
                    );
                    break;

                case 'label_deleted':
                    console.log('Label deleted:', data.payload);
                    // Xóa label khỏi tất cả cards
                    setColumns(prevColumns => 
                        prevColumns.map(col => ({
                            ...col,
                            cards: col.cards.map(card => ({
                                ...card,
                                labels: (card.labels || []).filter(label => 
                                    label.id !== data.payload.id
                                )
                            }))
                        }))
                    );
                    break;

                default:
                    // Ignore other change types
                    break;
            }
        };

        // Lắng nghe board_updated events
        socketRef.on('board_updated', handleBoardUpdate);

        // Cleanup
        return () => {
            if (socketRef) {
                socketRef.off('board_updated', handleBoardUpdate);
            }
        };
    }, [socketRef, board?.id]);

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

        // Chỉ update state local, không gọi API ở đây nữa
        // vì API đã được gọi từ Column component
        const newColumns = columns.map(col =>
            col.id === updatedColumn.id ? updatedColumn : col
        );
        setColumns(newColumns);
        
        // Không cần gọi updateColumn API ở đây nữa
        // vì đã được gọi từ Column component rồi
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

            const newColumn = {
              ...response.column,
              cards: []
            };
            
            // Optimistic update
            setColumns([...columns, newColumn]);
            setNewColumnTitle('');
            setShowAddColumn(false);
            
            // Socket event sẽ được emit từ backend
            // emitBoardChange(board.id, 'column_add', newColumn);
            
            toast.success('Đã thêm cột mới');
        } catch (err) {
            toast.error('Không thể thêm cột mới');
            // Revert optimistic update nếu cần
        }
    };

    const handleAddCard = (card) => {
        if (!canModify) {
            toast.warning('Bạn không có quyền cập nhật bảng này');
            return;
        }

        console.log('Adding card:', card);
        // Optimistic update
        const newColumns = columns.map(col => {
            if (col.id === card.column_id) {
                return {
                    ...col,
                    cards: [...(col.cards || []), card]
                };
            }
            return col;
        });
        setColumns(newColumns);
        
        // Socket event sẽ được emit từ backend
        // emitBoardChange(board.id, 'card_created', card);
    };

    const handleDeleteColumn = (columnId) => {
        // Optimistic update
        const updatedColumns = columns.filter(col => col.id !== columnId);
        setColumns(updatedColumns);
        
        // Socket event sẽ được emit từ backend
        // emitBoardChange(board.id, 'column_delete', columnId);
    };

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
