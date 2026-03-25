// server/index.js

require('dotenv').config({ path: '../.env' }); // Reverted back to ensure local development works from root

const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const morgan   = require('morgan');
const rateLimit = require('express-rate-limit');

const connectDB    = require('./config/db');
const analyzeRoute = require('./routes/analyze');
const reportsRoute = require('./routes/reports');
const authRoute    = require('./routes/auth');
const userRoute    = require('./routes/user');
const billingRoute = require('./routes/billing');
const errorHandler = require('./middleware/errorHandler');

const app  = express();
const PORT = process.env.PORT || 5001;

// ─── Global Middleware ─────────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  "https://antigravity-seo-analyzer-client.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (origin.startsWith("http://localhost")) {
      return callback(null, true);
    }

    if (origin.endsWith(".vercel.app") || origin.endsWith(".onrender.com")) {
      return callback(null, true);
    }

    const isAllowed = allowedOrigins.some(allowed => {
      if (!allowed) return false;
      const normAllowed = allowed.trim().replace(/\/$/, '');
      const normOrigin  = origin.trim().replace(/\/$/, '');
      return normAllowed === normOrigin;
    });

    if (isAllowed) return callback(null, true);

    console.log("Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ─── Stripe webhook BEFORE JSON ────────────────────────────────────────────
app.post(
  '/api/billing/webhook',
  express.raw({ type: 'application/json' }),
  billingRoute.webhookHandler || ((req, res) => res.status(501).send('Not implemented'))
);

// ─── Body + Logger ─────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// ─── Rate Limiting ─────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

const analyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
});

app.use(globalLimiter);

// ─── Routes ────────────────────────────────────────────────────────────────
app.use('/api/analyze', analyzeLimiter, analyzeRoute);
app.use('/api/reports', reportsRoute);
app.use('/api/auth',    authRoute);
app.use('/api/user',    userRoute);
app.use('/api/billing', billingRoute);

// ─── Health Check ──────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── 404 ───────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error Handler ─────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── 🚀 START SERVER AFTER DB CONNECT ──────────────────────────────────────
async function startServer() {
  try {
    console.log("🔍 Checking MONGO URI:", process.env.MONGODB_URI);

    await connectDB(); // ✅ FIX (wait for DB)

    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`Environment : ${process.env.NODE_ENV}`);
      console.log(`MongoDB     : ${process.env.MONGODB_URI ? 'configured' : '❌ missing'}\n`);
    });

  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
}

startServer();

module.exports = app;