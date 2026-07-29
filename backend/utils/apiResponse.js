/**
 * Standardized API Response Utility
 * Creates consistent response objects for all API endpoints
 */

/**
 * Success response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 200)
 * @param {string} message - Success message
 * @param {Object} data - Response data
 * @param {Object} meta - Optional metadata (pagination, etc.)
 * @returns {Object} - Express response
 */
const success = (res, statusCode = 200, message = 'Success', data = null, meta = null) => {
  const response = {
    status: 'success',
    message,
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  if (meta !== null && meta !== undefined) {
    response.meta = meta;
  }

  return res.status(statusCode).json(response);
};

/**
 * Error response
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {string} message - Error message
 * @param {Object} errors - Optional validation errors
 * @returns {Object} - Express response
 */
const error = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = {
    status: 'error',
    message,
  };

  if (errors !== null && errors !== undefined) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * 404 Not Found response
 * @param {Object} res - Express response object
 * @param {string} message - Not found message
 * @returns {Object} - Express response
 */
const notFound = (res, message = 'Resource not found') => {
  return res.status(404).json({
    status: 'error',
    message,
  });
};

/**
 * 401 Unauthorized response
 * @param {Object} res - Express response object
 * @param {string} message - Unauthorized message
 * @returns {Object} - Express response
 */
const unauthorized = (res, message = 'Unauthorized') => {
  return res.status(401).json({
    status: 'error',
    message,
  });
};

/**
 * 403 Forbidden response
 * @param {Object} res - Express response object
 * @param {string} message - Forbidden message
 * @returns {Object} - Express response
 */
const forbidden = (res, message = 'Forbidden') => {
  return res.status(403).json({
    status: 'error',
    message,
  });
};

/**
 * 400 Bad Request response
 * @param {Object} res - Express response object
 * @param {string} message - Bad request message
 * @param {Object} errors - Validation errors
 * @returns {Object} - Express response
 */
const badRequest = (res, message = 'Bad Request', errors = null) => {
  return error(res, 400, message, errors);
};

module.exports = {
  success,
  error,
  notFound,
  unauthorized,
  forbidden,
  badRequest,
};