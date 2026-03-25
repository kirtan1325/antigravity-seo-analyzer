// server/routes/billing.js
const express  = require('express');
const router   = express.Router();
const Razorpay = require('razorpay');
const crypto   = require('crypto');
const auth     = require('../middleware/auth');
const User     = require('../models/User');

/**
 * ─── Instantiate Razorpay ──────────────────────────────────────────────
 */
let razorpayInstance;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
}

/**
 * ─── POST /api/billing/create-order ──────────────────────────────────────
 * Creates a Razorpay Order for Pro or Agency plans.
 */
router.post('/create-order', auth, async (req, res, next) => {
  try {
    if (!razorpayInstance) {
      return res.status(500).json({ error: 'Razorpay keys not configured.' });
    }

    const { planId } = req.body; // 'pro' or 'agency'
    const { PRICING } = require('../shared/constants');
    
    if (!PRICING[planId]) {
      return res.status(400).json({ error: 'Invalid plan selected.' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Amount should be in paise (INR * 100)
    const amountInINR = PRICING[planId].monthly;
    const amountInPaise = amountInINR * 100;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `rcpt_${user._id.toString().slice(-6)}_${Date.now()}`,
      notes: {
        userId: user._id.toString(),
        planId: planId
      }
    };

    const order = await razorpayInstance.orders.create(options);
    
    res.json({ success: true, order, keyId: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error('Razorpay Error:', err);
    // Mask Razorpay auth codes as 500 server errors so they don't conflict with frontend sessions
    res.status(500).json({ error: 'Failed to connect to billing provider. Check API keys.' });
  }
});

/**
 * ─── POST /api/billing/verify-payment ────────────────────────────────────
 * Verifies Razorpay payment signature & upgrades user
 */
router.post('/verify-payment', auth, async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing Razorpay properties.' });
    }

    // Verify signature
    const secret = process.env.RAZORPAY_KEY_SECRET;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + '|' + razorpay_payment_id)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid payment signature!' });
    }

    // Upgrade User
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    
    user.plan = planId;
    user.isActive = true;
    user.stripeSubscriptionId = razorpay_payment_id; // saving payment Id for records
    await user.save();

    res.json({ success: true, message: 'Payment verified and plan upgraded!' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
