// shared/helpers.js
// Pure utility functions — no side effects, no imports

/**
 * Normalise a user-supplied URL.
 * Adds https:// if missing, strips trailing slashes.
 */
function normaliseURL(raw) {
  let url = raw.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  try {
    const parsed = new URL(url);
    return parsed.href.replace(/\/$/, '');
  } catch {
    return null;
  }
}

/**
 * Return the score grade object for a numeric score.
 */
function getScoreGrade(score) {
  if (score >= 85) return { label: 'Excellent',       color: '#10B981', emoji: '🟢' };
  if (score >= 70) return { label: 'Good',            color: '#3B82F6', emoji: '🔵' };
  if (score >= 50) return { label: 'Needs Work',      color: '#F59E0B', emoji: '🟡' };
  return             { label: 'Critical Issues',  color: '#EF4444', emoji: '🔴' };
}

/**
 * Format a date for display ("Mar 15, 2025").
 */
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

/**
 * Clamp a value between min and max.
 */
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Convert milliseconds to a human readable string ("1.3s").
 */
function msToDisplay(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

/**
 * Truncate text with ellipsis.
 */
function truncate(text, maxLen = 60) {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen) + '…' : text;
}

/**
 * Extract root domain from URL string.
 */
function extractDomain(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

export {
  normaliseURL,
  getScoreGrade,
  formatDate,
  clamp,
  msToDisplay,
  truncate,
  extractDomain,
};
