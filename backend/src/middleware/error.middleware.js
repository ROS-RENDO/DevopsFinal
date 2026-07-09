const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log the full error and stack trace securely on the server side
  logger.error('Unhandled Exception Caught', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip
  });

  // Safe fallback: Return generic error to the client, never exposing internal details
  res.status(500).json({
    status: 'ERROR',
    message: 'An unexpected internal server error occurred.'
  });
};

module.exports = {
  errorHandler
};
