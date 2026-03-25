// server/routes/user.js
const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const User    = require('../models/User');
const Report  = require('../models/Report');

// ─── GET /api/user/profile ────────────────────────────────────────────────
router.get('/profile', auth, async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Fetch usage stats
    const totalReports = await Report.countDocuments({ userId: req.userId });
    const lastReport   = await Report
      .findOne({ userId: req.userId })
      .sort({ createdAt: -1 })
      .select('score url createdAt');

    res.json({
      success: true,
      user,
      stats: {
        totalReports,
        lastReport,
        scansToday:  user.scansToday,
        totalScans:  user.totalScans,
        bestScore:   user.bestScore,
        streak:      user.streak,
      },
    });
  } catch (err) { next(err); }
});

// ─── PATCH /api/user/profile ──────────────────────────────────────────────
router.patch('/profile', auth, async (req, res, next) => {
  try {
    const allowed = ['name'];   // Only allow safe fields to be updated
    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.userId, updates, {
      new: true, runValidators: true,
    });

    res.json({ success: true, user });
  } catch (err) { next(err); }
});

module.exports = router;
