// server/models/Report.js
const mongoose = require('mongoose');

// ─── Sub-schemas ───────────────────────────────────────────────────────────
const IssueSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  severity:    { type: String, enum: ['critical', 'warning', 'good'], required: true },
  category:    { type: String },  // 'meta', 'speed', 'content', 'technical'
  description: { type: String },
  fix:         { type: String },
  points:      { type: Number, default: 0 },  // score impact if fixed
}, { _id: false });

const KeywordSchema = new mongoose.Schema({
  word:      { type: String },
  count:     { type: Number, default: 1 },
  relevance: { type: String, enum: ['High', 'Medium', 'Low'] },
}, { _id: false });

const SpeedDataSchema = new mongoose.Schema({
  performanceScore:  { type: Number },
  fcp:               { type: Number },  // First Contentful Paint (ms)
  lcp:               { type: Number },  // Largest Contentful Paint (ms)
  tbt:               { type: Number },  // Total Blocking Time (ms)
  cls:               { type: Number },  // Cumulative Layout Shift
  speedIndex:        { type: Number },
  grade:             { type: String },  // A / B / C / D / F
}, { _id: false });

// ─── Main Report Schema ────────────────────────────────────────────────────
const ReportSchema = new mongoose.Schema({
  // Identity
  url:    { type: String, required: true, index: true },
  domain: { type: String },

  // Ownership
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },

  // Core Results
  score:         { type: Number, required: true, min: 0, max: 100 },
  grade:         { type: String },   // Excellent / Good / Needs Work / Critical Issues
  issues:        [IssueSchema],
  keywords:      [KeywordSchema],
  speedData:     SpeedDataSchema,

  // Page Meta
  pageTitle:       { type: String },
  metaDescription: { type: String },
  h1:              { type: String },
  wordCount:       { type: Number },
  mobileFriendly:  { type: Boolean },
  hasSSL:          { type: Boolean },
  hasCanonical:    { type: Boolean },
  hasRobots:       { type: Boolean },
  imagesTotalCount: { type: Number },
  imagesWithoutAlt: { type: Number },
  internalLinks:   { type: Number },
  externalLinks:   { type: Number },

  // AI
  aiSummary:        { type: String },
  aiRecommendations: [String],

  // Metadata
  analysisVersion: { type: String, default: '1.0' },
  analysisTime:    { type: Number },   // ms taken
  createdAt:       { type: Date, default: Date.now, index: true },
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// ─── Virtuals ──────────────────────────────────────────────────────────────
ReportSchema.virtual('criticalCount').get(function () {
  if (!this.issues || !Array.isArray(this.issues)) return 0;
  return this.issues.filter(i => i.severity === 'critical').length;
});

ReportSchema.virtual('warningCount').get(function () {
  if (!this.issues || !Array.isArray(this.issues)) return 0;
  return this.issues.filter(i => i.severity === 'warning').length;
});

// ─── Indexes ───────────────────────────────────────────────────────────────
ReportSchema.index({ userId: 1, createdAt: -1 });
ReportSchema.index({ url: 1, createdAt: -1 });

module.exports = mongoose.model('Report', ReportSchema);
