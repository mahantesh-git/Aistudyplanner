// Custom error classes for better error handling

export class TaskError extends Error {
  constructor(message, code = 'TASK_ERROR') {
    super(message);
    this.name = 'TaskError';
    this.code = code;
  }
}

export class ValidationError extends TaskError {
  constructor(message) {
    super(message, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends TaskError {
  constructor(message = 'Authentication required') {
    super(message, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class NetworkError extends TaskError {
  constructor(message = 'Network error occurred') {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

/**
 * Creates a proper Error object from API response
 * @param {Object} error - Error object from API call
 * @returns {TaskError} Proper error object
 */
export const createErrorFromResponse = (error) => {
  if (!error.response) {
    return new NetworkError(error.message || 'Network error occurred');
  }
  
  const { status, data } = error.response;
  const message = data?.message || `HTTP ${status} error`;
  
  switch (status) {
    case 400:
      return new ValidationError(message);
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new TaskError(message, 'ACCESS_DENIED');
    case 404:
      return new TaskError(message, 'NOT_FOUND');
    case 500:
      return new TaskError(message, 'SERVER_ERROR');
    default:
      return new TaskError(message);
  }
};
