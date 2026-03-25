// server/middleware/subscription.js
const { PLAN_LIMITS } = require('../shared/constants');
const User = require('../models/User');

/**
 * Ensures the authenticated user has a 'pro' or 'agency' plan.
 * Returns 403 (Forbidden) if they are on a 'free' plan.
 */
async function requirePro(req, res, next) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(401).json({ error: 'Please log in to use this feature.' });

    if (user.plan === 'pro' || user.plan === 'agency') {
      return next();
    }

    res.status(403).json({
      error: 'Pro account required.',
      message: 'This feature is only available for Pro and Agency subscribers.',
      upgradeUrl: '/pricing',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Gated check for AI suggestions. Limits free users to 1 per day or blocks entirely.
 * In this implementation, we allow free users to SEE a basic score but not the AI summary.
 */
async function checkFeatureAccess(featureName) {
  return async (req, res, next) => {
    try {
      const user = await User.findById(req.userId);
      if (!user) return next(); // Guest users handled separately in route

      const limits = PLAN_LIMITS[user.plan];
      if (limits[featureName] === true || limits[featureName] === -1) {
         return next();
      }

      res.status(403).json({
        error: `Feature Locked: ${featureName}`,
        message: `Upgrade to Pro to unlock this advanced feature.`,
        plan: user.plan
      });
    } catch (err) {
      next(err);
    }
  };
}

module.exports = { requirePro, checkFeatureAccess };
