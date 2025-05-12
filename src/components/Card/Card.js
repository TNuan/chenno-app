import React, { useState } from 'react';
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

const Card = ({ card, canModify = true, onClick , boardMembers}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Xử lý click vào card
  const handleCardClick = (e) => {
    e.preventDefault();
    if (onClick) {
      onClick(card);
    }
  };

  return (
    <div 
      className={`p-3 mb-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm ${canModify ? 'cursor-pointer' : ''} hover:shadow-md transition-shadow border border-transparent hover:border-gray-200 dark:hover:border-gray-600`}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Simplified Card - Show only essential info */}
      
      {/* Labels - Just showing first 2 */}
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
      
      {/* Card Title - Main focus */}
      <h4 className="text-sm font-medium text-gray-800 dark:text-gray-200">
        {card.title}
      </h4>
      
      {/* Minimal Metadata */}
      <div className="mt-2 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          {/* Due Date - show as colored dot if exists */}
          {card.due_date && (
            <span className={`flex items-center ${getDueDateClass(card.due_date)}`}>
              <FiClock className="w-3 h-3" />
            </span>
          )}
          
          {/* Attachment indicator */}
          {card.attachment_count > 0 && (
            <span className="flex items-center text-gray-500 dark:text-gray-400">
              <FiPaperclip className="w-3 h-3" />
              <span className="ml-0.5">{card.attachment_count}</span>
            </span>
          )}
          
          {/* Comment count */}
          {card.comment_count > 0 && (
            <span className="flex items-center text-gray-500 dark:text-gray-400">
              <FiMessageSquare className="w-3 h-3" />
              <span className="ml-0.5">{card.comment_count}</span>
            </span>
          )}
        </div>
        
        {/* Assignee initials */}
        {card.assigned_to && (
          <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xs">
            {card.assigned_to_name ? card.assigned_to_name.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;