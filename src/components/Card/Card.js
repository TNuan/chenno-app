import React, { useState } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { FiClock, FiUser, FiPaperclip, FiMessageSquare, FiTag } from 'react-icons/fi';
import { isPast, isToday } from 'date-fns';

// Hàm tính class cho thời hạn
const getDueDateClass = (dueDate) => {
  if (!dueDate) return '';
  
  const date = new Date(dueDate);
  
  if (isPast(date) && !isToday(date)) {
    return 'text-red-600 dark:text-red-400';
  } else if (isToday(date)) {
    return 'text-orange-600 dark:text-orange-400';
  } else {
    return 'text-gray-600 dark:text-gray-400';
  }
};

// Tách hàm renderCoverImage ra khỏi component
const CardCoverImage = React.memo(({ coverImg }) => {
  if (!coverImg) return null;

  // Kiểm tra xem cover_img là URL ảnh hay mã màu
  const isImageUrl = coverImg.startsWith('http') || 
                     coverImg.startsWith('/static') || 
                     coverImg.startsWith('data:');
  const isColorCode = coverImg.startsWith('#');

  if (isImageUrl) {
    return (
      <div className="w-full h-20 rounded-md overflow-hidden">
        <img
          src={coverImg}
          alt="Card cover"
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error('Image failed to load:', coverImg);
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'block';
          }}
        />
        <div 
          className="hidden w-full h-full rounded-md bg-gradient-to-br from-blue-400 to-purple-500"
        />
      </div>
    );
  } else if (isColorCode) {
    return (
      <div 
        className="w-full h-20 rounded-md"
        style={{ backgroundColor: coverImg }}
      />
    );
  }

  return null;
});

const Card = ({ card, index, canModify = true, onClick, boardMembers }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Xử lý click vào card
  const handleCardClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick(card);
    }
  };

  // Đảm bảo card.id luôn có giá trị
  const cardId = card && card.id ? `card-${card.id.toString()}` : `card-placeholder-${index}`;
  // Đảm bảo canModify luôn là boolean
  const canModifyBoolean = Boolean(canModify);

  return (
    <Draggable 
      draggableId={cardId} 
      index={index}
      isDragDisabled={!canModifyBoolean}
    >
      {(provided, snapshot) => (
        <div 
          className={`mb-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm draggable-card
            ${canModifyBoolean ? 'cursor-pointer' : ''} 
            hover:shadow-md transition-shadow border 
            ${snapshot.isDragging ? 'border-blue-400 shadow-md drag-card-preview' : 'border-transparent hover:border-gray-200 dark:hover:border-gray-600'}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleCardClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            ...provided.draggableProps.style,
          }}
        >
          {/* Cover Image */}
          <CardCoverImage coverImg={card.cover_img} />

          {/* Card Labels */}
          {card.labels && card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {card.labels.slice(0, 2).map(label => (
                <span
                  key={label.id}
                  className="w-6 h-1.5 rounded-sm"
                  style={{ backgroundColor: label.color }}
                />
              ))}
              {card.labels.length > 2 && (
                <span className="w-6 h-1.5 rounded-sm bg-gray-300 dark:bg-gray-500" />
              )}
            </div>
          )}
          
          <h4 className="p-3 text-sm font-medium text-gray-800 dark:text-gray-200">
            {card.title}
          </h4>
          
          <div className="mt-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {card.due_date && (
                <span className={`flex items-center ${getDueDateClass(card.due_date)}`}>
                  <FiClock className="w-3 h-3" />
                </span>
              )}
              
              {/* Đảm bảo attachment count được hiển thị */}
              {card.attachment_count > 0 && (
                <span className="flex items-center text-gray-500 dark:text-gray-400">
                  <FiPaperclip className="w-3 h-3" />
                  <span className="ml-0.5">{card.attachment_count}</span>
                </span>
              )}
              
              {card.comment_count > 0 && (
                <span className="flex items-center text-gray-500 dark:text-gray-400">
                  <FiMessageSquare className="w-3 h-3" />
                  <span className="ml-0.5">{card.comment_count}</span>
                </span>
              )}
            </div>
            
            {card.assigned_to && (
              <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs">
                {card.assigned_to_name ? card.assigned_to_name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Card;