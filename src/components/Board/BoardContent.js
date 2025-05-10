import React, { useState, useEffect, useRef } from 'react';
import { Container, Draggable } from 'react-smooth-dnd';
import { FiPlus, FiLock } from 'react-icons/fi';
import Column from '../Column/Column';
import { toast } from 'react-toastify';
import { getColumnsByBoard, createColumn } from '../../services/api';

const BoardContent = ({ board }) => {
    const [columns, setColumns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddColumn, setShowAddColumn] = useState(false);
    const [newColumnTitle, setNewColumnTitle] = useState('');


    // Check if user has permission to modify the board
    const canModify = board && board.user_role && board.user_role !== "";

    // Fetch columns data
    useEffect(() => {
        const fetchColumns = async () => {
            if (!board) return;

            try {
                const response = await getColumnsByBoard(board.id);
                setColumns(response.columns);
                setIsLoading(false);
            } catch (err) {
                setError('Failed to load board columns');
                setIsLoading(false);
                toast.error('Không thể tải dữ liệu cột');
            }
        };

        fetchColumns();
    }, [board]);

    // Handle column drop
    const onColumnDrop = (dropResult) => {
        if (!canModify) {
            toast.warning('Bạn không có quyền cập nhật bảng này');
            return;
        }

        if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
            const newColumns = [...columns];
            const [removedColumn] = newColumns.splice(dropResult.removedIndex, 1);
            newColumns.splice(dropResult.addedIndex, 0, removedColumn);
            setColumns(newColumns);

            // TODO: Update column order in backend
            toast.success('Đã cập nhật vị trí cột');
        }
    };

    // Handle card drop
    const onCardDrop = (columnId, dropResult) => {
        if (!canModify) {
            toast.warning('Bạn không có quyền cập nhật bảng này');
            return;
        }

        if (dropResult.removedIndex !== null || dropResult.addedIndex !== null) {
            const newColumns = [...columns];
            const sourceColumn = newColumns.find(col => col.id === columnId);
            const [removedCard] = sourceColumn.cards.splice(dropResult.removedIndex, 1);
            sourceColumn.cards.splice(dropResult.addedIndex, 0, removedCard);
            setColumns(newColumns);

            // TODO: Update card position in backend
            toast.success('Đã cập nhật vị trí thẻ');
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

        // TODO: Update column in backend
        toast.success('Đã cập nhật thông tin cột');
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

            setColumns([...columns, response.column]);
            setNewColumnTitle('');
            setShowAddColumn(false);
            toast.success('Đã thêm cột mới');
        } catch (err) {
            toast.error('Không thể thêm cột mới');
        }
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
        <div className="flex flex-col min-h-full"
        >
            {/* Board Content - Fixed height with horizontal scroll */}
            <div

                className="flex-1 p-4 overflow-x-auto overflow-y-hidden"
            >
                <div className="inline-flex min-w-full pb-4 h-full">
                    <Container
                        orientation="horizontal"
                        onDrop={onColumnDrop}
                        dragHandleSelector={canModify ? ".column-drag-handle" : ".non-draggable"}
                        dropPlaceholder={{
                            animationDuration: 150,
                            showOnTop: true,
                            className: 'column-drop-preview'
                        }}
                        dragClass="column-drag-ghost"
                        dropClass="column-drop-ghost"
                        className="flex gap-4 h-full"
                    >
                        {columns.map((column) => (
                            <Draggable key={column.id}>
                                <div className={canModify ? "column-drag-handle h-full" : "non-draggable h-full"}>
                                    <Column
                                        column={column}
                                        onCardDrop={onCardDrop}
                                        onUpdateColumnState={handleColumnUpdate}
                                        canModify={canModify}
                                    />
                                </div>
                            </Draggable>
                        ))}

                        {/* Add Column Button - Only visible to members */}
                        {canModify && (
                            <div className="w-72 shrink-0 h-auto">
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
                    </Container>
                </div>
            </div>

        </div>
    );
};

export default BoardContent;
