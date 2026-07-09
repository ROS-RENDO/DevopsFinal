const xss = require('xss');

// Generic validation and sanitization middleware
const validate = (schema) => (req, res, next) => {
  try {
    // 1. Validate the request body against the Zod schema (Server-side allow-list)
    const validData = schema.parse(req.body);
    
    // 2. Output Encoding / Escaping: Sanitize all string fields to prevent XSS injection
    const sanitizedData = {};
    for (const [key, value] of Object.entries(validData)) {
      if (typeof value === 'string') {
        sanitizedData[key] = xss(value);
      } else {
        sanitizedData[key] = value;
      }
    }
    
    // Override the req.body with the sanitized and validated data
    req.body = sanitizedData;
    
    next();
  } catch (error) {
    // If Zod validation fails, return a 400 Bad Request with the specific errors
    if (error.errors) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      });
    }
    return res.status(400).json({ error: 'Invalid input' });
  }
};

module.exports = {
  validate
};
