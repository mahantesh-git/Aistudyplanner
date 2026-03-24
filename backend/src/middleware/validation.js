// Validation middleware for task operations

const validateTaskInput = (req, res, next) => {
  const { topic, title, description, subjectId, scheduledTime, duration, deadline, dueDate, priority, status } = req.body;
  
  // Handle both frontend (title) and backend (topic) field names
  const taskTopic = topic || title;
  // Handle both frontend (dueDate) and backend (deadline) field names
  const taskDeadline = deadline || dueDate;
  
  // Required field validation - only for POST requests (full creation)
  if (req.method === 'POST') {
    if (!taskTopic || typeof taskTopic !== 'string' || taskTopic.trim().length === 0) {
      return res.status(400).json({ message: 'Topic/Title is required and must be a non-empty string' });
    }
  }
  
  // For PUT requests (updates), validate topic/title only if provided
  if (req.method === 'PUT') {
    // Check if topic or title is being updated
    if (topic !== undefined || title !== undefined) {
      if (taskTopic && (typeof taskTopic !== 'string' || taskTopic.trim().length === 0)) {
        return res.status(400).json({ message: 'Topic/Title must be a non-empty string if provided' });
      }
    }
    
    // If no topic/title but other fields are provided, that's fine for status updates
    const hasOtherFields = description !== undefined || subjectId !== undefined || 
                          scheduledTime !== undefined || duration !== undefined || 
                          deadline !== undefined || dueDate !== undefined || priority !== undefined || status !== undefined;
    
    // If no fields at all are being updated, that's an error
    if (!hasOtherFields && (topic === undefined && title === undefined)) {
      return res.status(400).json({ message: 'At least one field must be provided for update' });
    }
  }
  
  // Optional field validations
  if (description !== undefined && (typeof description !== 'string' || description.length > 1000)) {
    return res.status(400).json({ message: 'Description must be a string with max 1000 characters' });
  }
  
  if (priority !== undefined && (typeof priority !== 'number' || priority < 1 || priority > 5)) {
    return res.status(400).json({ message: 'Priority must be a number between 1 and 5' });
  }
  
  if (duration !== undefined && (typeof duration !== 'number' || duration < 1 || duration > 480)) {
    return res.status(400).json({ message: 'Duration must be a number between 1 and 480 minutes' });
  }
  
  if (status !== undefined && !['pending', 'completed', 'skipped'].includes(status)) {
    return res.status(400).json({ message: 'Status must be one of: pending, completed, skipped' });
  }
  
  // Date validation
  if (taskDeadline !== undefined) {
    const deadlineDate = new Date(taskDeadline);
    if (isNaN(deadlineDate.getTime())) {
      return res.status(400).json({ message: 'Deadline must be a valid date' });
    }
  }
  
  if (scheduledTime !== undefined) {
    const scheduledDate = new Date(scheduledTime);
    if (isNaN(scheduledDate.getTime())) {
      return res.status(400).json({ message: 'Scheduled time must be a valid date' });
    }
  }
  
  // ObjectId validation for subjectId
  if (subjectId !== undefined && subjectId !== null) {
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!objectIdRegex.test(subjectId)) {
      return res.status(400).json({ message: 'Subject ID must be a valid ObjectId' });
    }
  }
  
  next();
};

const validateDateQuery = (req, res, next) => {
  if (req.query.date) {
    const date = new Date(req.query.date);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ message: 'Date query parameter must be a valid date' });
    }
  }
  next();
};

module.exports = {
  validateTaskInput,
  validateDateQuery
};
