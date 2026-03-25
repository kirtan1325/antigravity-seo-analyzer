// server/index.js  —  Entry point !
require('dotenv').config({ path: '../.env' });

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
const errorHandler = require('./middleware/errorHandler');

// ─── App ───────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 5001;

// ─── Connect Database ──────────────────────────────────────────────────────
connectDB();

// ─── Global Middleware ─────────────────────────────────────────────────────
app.use(helmet());
const allowedOrigins = [
  process.env.CLIENT_URL, // your Vercel frontend
  "https://antigravity-seo-analyzer-client.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    // allow localhost (dev)
    if (origin.startsWith("http://localhost")) {
      return callback(null, true);
    }

    // allow production frontend
    const isAllowed = allowedOrigins.some(allowed => {
      if (!allowed) return false;
      // Normalise both strings and strip trailing slashes for fool-proof comparison
      const normAllowed = allowed.trim().replace(/\/$/, '');
      const normOrigin  = origin.trim().replace(/\/$/, '');
      return normAllowed === normOrigin;
    });

    if (isAllowed) {
      return callback(null, true);
    }

    console.log("Blocked by CORS:", origin); // debug log
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));
// ─── Routes ────────────────────────────────────────────────────────────────
const billingRoute = require('./routes/billing');

// Stripe webhook needs raw body — BEFORE express.json()
app.post('/api/billing/webhook', express.raw({ type: 'application/json' }), require('./routes/billing').webhookHandler || ((req, res) => res.status(501).send('Not implemented')));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));

// ─── Rate Limiting ─────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

const analyzeLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  // 1 hour
  max: 10,                    // 10 free analyses per hour per IP
  message: { error: 'Hourly analysis limit reached. Sign up for Pro for unlimited scans.' },
});

app.use(globalLimiter);

// ─── Routes (Auth & Logic) ─────────────────────────────────────────────────
app.use('/api/analyze', analyzeLimiter, analyzeRoute);
app.use('/api/reports', reportsRoute);
app.use('/api/auth',    authRoute);
app.use('/api/user',    userRoute);
app.use('/api/billing',  billingRoute); // For create-checkout etc

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

// ─── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Antigravity SEO Server running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV}`);
  console.log(`   MongoDB     : ${process.env.MONGODB_URI ? 'configured' : '⚠ missing'}`);
  console.log(`   PageSpeed   : ${process.env.PAGESPEED_API_KEY ? 'configured' : '⚠ missing'}\n`);
});

module.exports = app;
