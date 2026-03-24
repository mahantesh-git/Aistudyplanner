// Utility functions for task data normalization

/**
 * Normalizes task data between frontend and backend field names
 * @param {Object} task - Task object from backend
 * @returns {Object} Normalized task object for frontend
 */
export const normalizeTask = (task) => {
  return {
    ...task,
    title: task.title || task.topic, // Use title if exists, otherwise topic
    dueDate: task.deadline // Map deadline to dueDate for frontend compatibility
  };
};

/**
 * Normalizes an array of tasks
 * @param {Array} tasks - Array of task objects from backend
 * @returns {Array} Array of normalized task objects for frontend
 */
export const normalizeTasks = (tasks) => {
  return tasks.map(normalizeTask);
};

/**
 * Prepares task data for sending to backend
 * @param {Object} taskData - Task data from frontend
 * @returns {Object} Task data formatted for backend
 */
export const prepareTaskForBackend = (taskData) => {
  const { title, dueDate, ...rest } = taskData;
  return {
    ...rest,
    topic: title, // Map frontend title to backend topic
    deadline: dueDate // Map frontend dueDate to backend deadline
  };
};
