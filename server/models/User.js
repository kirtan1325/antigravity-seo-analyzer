// server/models/User.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name:  { type: String, required: true, trim: true, maxlength: 100 },
  email: {
    type: String, required: true, unique: true,
    lowercase: true, trim: true,
  },
  password: { type: String, required: true, select: false, minlength: 8 },

  plan: {
    type: String,
    enum: ['free', 'pro', 'agency'],
    default: 'free',
  },

  // Usage tracking
  scansToday:      { type: Number, default: 0 },
  scansResetAt:    { type: Date,   default: Date.now },
  totalScans:      { type: Number, default: 0 },
  lastActiveAt:    { type: Date,   default: Date.now },

  // Gamification
  bestScore:       { type: Number, default: 0 },
  streak:          { type: Number, default: 0 },   // days in a row
  lastStreakDate:  { type: Date },

  // Billing
  stripeCustomerId:     { type: String },
  stripeSubscriptionId: { type: String },
  planExpiresAt:        { type: Date },

  isVerified:  { type: Boolean, default: false },
  isActive:    { type: Boolean, default: true },
  createdAt:   { type: Date, default: Date.now },
}, {
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      delete ret.password;
      delete ret.__v;
      return ret;
    },
  },
});

// ─── Hash password before save ─────────────────────────────────────────────
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance methods ──────────────────────────────────────────────────────
UserSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

UserSchema.methods.canScan = function () {
  const { PLAN_LIMITS } = require('../shared/constants');
  const limit = PLAN_LIMITS[this.plan].scansPerDay;
  if (limit === -1) return true;  // unlimited

  // Reset counter if it's a new day
  const now = new Date();
  const resetAt = new Date(this.scansResetAt);
  if (now.toDateString() !== resetAt.toDateString()) {
    this.scansToday = 0;
    this.scansResetAt = now;
  }

  return this.scansToday < limit;
};

UserSchema.methods.incrementScan = async function () {
  this.scansToday += 1;
  this.totalScans += 1;
  this.lastActiveAt = new Date();
  await this.save();
};

module.exports = mongoose.model('User', UserSchema);
