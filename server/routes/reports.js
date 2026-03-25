// server/routes/reports.js
const express = require('express');
const router  = express.Router();
const Report  = require('../models/Report');
const auth    = require('../middleware/auth');

// ─── GET /api/reports — User's report history ─────────────────────────────
router.get('/', auth, async (req, res, next) => {
  try {
    let { page, limit } = req.query;
    page = parseInt(page) || 1;
    limit = parseInt(limit) || 10;
    
    // Fetch user to check plan limits
    const User = require('../models/User');
    const { PLAN_LIMITS } = require('../shared/constants');
    const user = await User.findById(req.userId);
    
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    
    const planLimits = PLAN_LIMITS[user.plan] || PLAN_LIMITS.free;
    const maxReports = planLimits.savedReports;
    
    // Enforce hard cap for non-unlimited users
    if (maxReports !== -1) {
       limit = Math.min(limit, maxReports); // Never fetch more than allowed
    }

    const skip  = (page - 1) * limit;

    let [reports, total] = await Promise.all([
      Report.find({ userId: req.userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('url domain score grade mobileFriendly hasSSL createdAt aiSummary'),
      Report.countDocuments({ userId: req.userId }),
    ]);
    
    if (maxReports !== -1 && total > maxReports) {
       total = maxReports; // Cap apparent total to the plan limit
    }

    res.json({
      success: true,
      reports,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) { next(err); }
});

// ─── GET /api/reports/:id — Single report ─────────────────────────────────
router.get('/:id', auth, async (req, res, next) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found.' });
    }

    res.json({ success: true, report });
  } catch (err) { next(err); }
});

// ─── DELETE /api/reports/:id ──────────────────────────────────────────────
router.delete('/:id', auth, async (req, res, next) => {
  try {
    await Report.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (err) { next(err); }
});

// ─── GET /api/reports/url/:domain — Reports for a specific domain ─────────
router.get('/domain/:domain', auth, async (req, res, next) => {
  try {
    const reports = await Report.find({
      userId: req.userId,
      domain: req.params.domain,
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('score createdAt grade');

    res.json({ success: true, reports });
  } catch (err) { next(err); }
});

module.exports = router;
