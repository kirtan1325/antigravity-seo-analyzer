// server/middleware/errorHandler.js
/**
 * Global Express error handler.
 * Always returns JSON — never leaks stack traces in production.
 */
function errorHandler(err, req, res, _next) {
  const isDev = process.env.NODE_ENV === 'development';

  // Log every error server-side
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path}`, err.message);
  if (isDev) console.error(err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ error: messages.join('. ') });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({ error: `That ${field} is already in use.` });
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format.' });
  }

  // Default 500
  res.status(err.statusCode || 500).json({
    error: isDev ? err.message : 'Something went wrong. Please try again.',
    ...(isDev && { stack: err.stack }),
  });
}

module.exports = errorHandler;
