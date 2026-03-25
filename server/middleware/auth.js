// server/middleware/auth.js
const jwt = require('jsonwebtoken');

/**
 * Verifies Bearer JWT. Attaches req.userId on success.
 * Hard-fails (401) if no token or invalid token.
 */
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId    = decoded.userId;
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError'
      ? 'Session expired. Please log in again.'
      : 'Invalid token. Please log in again.';
    res.status(401).json({ error: msg });
  }
}

/**
 * Optional auth — attaches userId if token valid, but doesn't fail.
 * Use on public endpoints that have optional features for logged-in users.
 */
function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId    = decoded.userId;
    } catch { /* ignore */ }
  }
  next();
}

module.exports = auth;
module.exports.optional = optionalAuth;
