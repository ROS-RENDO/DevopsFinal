const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validate body, query, and params against the provided Zod schema
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      // If validation fails, Zod throws an error with detailed information
      return res.status(400).json({
        error: 'Input Validation Failed',
        details: err.errors,
      });
    }
  };
};

module.exports = {
  validate
};
