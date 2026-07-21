// Custom error class so controllers can `throw new ApiError(404, "User not found")`
// and let the centralized error handler format the response.

class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
