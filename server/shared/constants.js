// shared/constants.js
// Shared across client and server — no framework imports here

// ─── SEO Score Weights ─────────────────────────────────────────────────────
const SEO_WEIGHTS = {
  titleTag:        15,  // Title exists, 50-60 chars
  metaDescription: 15,  // Meta desc exists, 150-160 chars
  pageSpeed:       20,  // PageSpeed score from Google API
  mobileFriendly:  15,  // Mobile usability
  h1Tag:           10,  // Exactly one H1 present
  altText:         10,  // All images have alt attributes
  keywords:         5,  // Keyword density reasonable
  httpsSSL:         5,  // Site uses HTTPS
  canonical:        3,  // Canonical tag present
  robots:           2,  // Robots meta not blocking
};

// ─── Score Grades ──────────────────────────────────────────────────────────
const SCORE_GRADES = {
  EXCELLENT: { min: 85, label: 'Excellent',      color: '#10B981' },
  GOOD:      { min: 70, label: 'Good',           color: '#3B82F6' },
  AVERAGE:   { min: 50, label: 'Needs Work',     color: '#F59E0B' },
  POOR:      { min: 0,  label: 'Critical Issues', color: '#EF4444' },
};

// ─── Issue Severities ──────────────────────────────────────────────────────
const SEVERITY = {
  CRITICAL: 'critical',
  WARNING:  'warning',
  GOOD:     'good',
};

// ─── Plan Limits ───────────────────────────────────────────────────────────
const PLAN_LIMITS = {
  free: {
    scansPerDay:     5,
    historyDays:     0,
    aiSuggestions:   false,
    pdfExport:       false,
    competitorCheck: false,
    savedReports:    5,
  },
  pro: {
    scansPerDay:     -1,   // unlimited
    historyDays:     365,
    aiSuggestions:   true,
    pdfExport:       true,
    competitorCheck: true,
    savedReports:    -1,   // unlimited
  },
  agency: {
    scansPerDay:     -1,
    historyDays:     365,
    aiSuggestions:   true,
    pdfExport:       true,
    competitorCheck: true,
    savedReports:    -1,
    whiteLabel:      true,
    subAccounts:     10,
  },
};

// ─── Pricing (INR) ─────────────────────────────────────────────────────────
const PRICING = {
  pro:    { monthly: 499,  yearly: 3999  },
  agency: { monthly: 1999, yearly: 15999 },
};

// ─── API Endpoints ─────────────────────────────────────────────────────────
const API_ROUTES = {
  ANALYZE:       '/api/analyze',
  REPORTS:       '/api/reports',
  REPORT_BY_ID:  '/api/reports/:id',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGIN:    '/api/auth/login',
  AUTH_ME:       '/api/auth/me',
  USER_PROFILE:  '/api/user/profile',
};

module.exports = {
  SEO_WEIGHTS,
  SCORE_GRADES,
  SEVERITY,
  PLAN_LIMITS,
  PRICING,
  API_ROUTES,
};
