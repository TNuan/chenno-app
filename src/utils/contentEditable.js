/**
 *  Created by NTNuan's author on 06/10/2022
 */

export const saveContentAfterPressEnter = (e) => {
  if (e.key === 'Enter') {
    e.preventDefault()
    e.target.blur()
  }
}

export const selectAllInLineText = (e) => {
  e.target.focus()
  setTimeout(() => {
    e.target.select()
  }, 0)
}

/**
 * Handle keydown events for editable content
 * @param {Event} e - The keyboard event
 * @param {Function} submitHandler - Function to call when Enter is pressed
 * @param {Function} cancelHandler - Function to call when Escape is pressed
 */
export const handleEditableKeyDown = (e, submitHandler, cancelHandler) => {
  // Select all text when focused
  if (!e.target.dataset.selected) {
    setTimeout(() => {
      e.target.select()
      e.target.dataset.selected = 'true'
    }, 0)
  }

  if (e.key === 'Enter') {
    e.preventDefault()
    submitHandler(e)
  } else if (e.key === 'Escape') {
    e.preventDefault()
    cancelHandler(e)
  }
}

/**
 * Create props for editable content elements
 * @param {String} value - The current text value
 * @param {Function} onChangeHandler - Function to call when text changes
 * @param {Function} submitHandler - Function to call when edit is submitted
 * @param {Function} cancelHandler - Function to call when edit is canceled
 * @returns {Object} Props to spread onto an input element
 */
export const createEditableProps = (value, onChangeHandler, submitHandler, cancelHandler) => {
  return {
    type: "text",
    value: value,
    onChange: onChangeHandler,
    onBlur: submitHandler,
    onKeyDown: (e) => handleEditableKeyDown(e, submitHandler, cancelHandler),
    className: "w-full px-2 py-1 text-sm font-medium bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500",
    autoFocus: true,
    onFocus: selectAllInLineText,
  }
}