class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
      this.isOperational = true;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  class ValidationError extends AppError {
    constructor(message) {
      super(message, 400);
      this.name = 'ValidationError';
    }
  }
  
  class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
      super(message, 401);
      this.name = 'AuthenticationError';
    }
  }
  
  class AuthorizationError extends AppError {
    constructor(message = 'Not authorized') {
      super(message, 403);
      this.name = 'AuthorizationError';
    }
  }
  
  class NotFoundError extends AppError {
    constructor(message = 'Resource not found') {
      super(message, 404);
      this.name = 'NotFoundError';
    }
  }

  /**
 * Custom Error classes
 */
class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
    // Optional: attach an HTTP status code for use in controllers/middleware
    this.statusCode = 401;
  }
}

class RegistrationError extends Error {
  constructor(message = 'Registration error') {
    super(message);
    this.name = 'RegistrationError';
    this.statusCode = 400;
  }
}

class UserNotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'UserNotFoundError';
    this.statusCode = 404;
  }
}

class InvalidCredentialsError extends Error {
  constructor(message = 'Invalid credentials') {
    super(message);
    this.name = 'InvalidCredentialsError';
    this.statusCode = 401;
  }
}
  
  module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    UnauthorizedError,
    RegistrationError,
    UserNotFoundError,
    InvalidCredentialsError,
  };