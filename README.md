# ⬆ Antigravity SEO Analyzer

> Find out why your site isn't getting traffic — SEO score, exact problems, and plain-English fixes in under 10 seconds.

---

## 📁 Project Structure

```
antigravity-seo/
├── client/                          # React + Vite frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx                 # React entry point
│       ├── App.jsx                  # Router setup
│       ├── styles/
│       │   └── global.css           # Tailwind + custom CSS
│       ├── components/
│       │   ├── Navbar.jsx           # Sticky top navigation
│       │   ├── URLInput.jsx         # URL entry with validation
│       │   ├── LoadingAnimation.jsx # Step-by-step progress UI
│       │   ├── ScoreGauge.jsx       # Animated circular score ring
│       │   ├── IssueCard.jsx        # Expandable issue with fix
│       │   ├── FixPanel.jsx         # AI summary + keyword sidebar
│       │   └── MiniScoreBar.jsx     # Speed / mobile / SSL chips
│       ├── pages/
│       │   ├── Landing.jsx          # Home page with hero + pricing
│       │   ├── Dashboard.jsx        # Full report view
│       │   └── History.jsx          # Saved reports + auth forms
│       ├── hooks/
│       │   ├── useAnalysis.js       # Runs analysis, manages steps
│       │   └── useHistory.js        # Fetches + deletes report history
│       └── utils/
│           ├── api.js               # Axios client + typed API calls
│           └── store.js             # Zustand global state (analysis + auth)
│
├── server/                          # Node.js + Express backend
│   ├── index.js                     # App entry — middleware, routes, start
│   ├── package.json
│   ├── config/
│   │   └── db.js                    # MongoDB connection
│   ├── models/
│   │   ├── Report.js                # Mongoose schema for analysis reports
│   │   └── User.js                  # Mongoose schema for users
│   ├── routes/
│   │   ├── analyze.js               # POST /api/analyze — main analysis endpoint
│   │   ├── reports.js               # GET/DELETE /api/reports — history
│   │   ├── auth.js                  # POST /api/auth/register|login, GET /me
│   │   └── user.js                  # GET/PATCH /api/user/profile
│   ├── services/
│   │   ├── seoAnalyzer.js           # HTML parsing + SEO scoring engine
│   │   ├── speedChecker.js          # Google PageSpeed Insights API
│   │   └── aiSuggestions.js         # Anthropic Claude — AI summaries
│   └── middleware/
│       ├── auth.js                  # JWT verification middleware
│       └── errorHandler.js          # Global Express error handler
│
├── shared/                          # Shared between client and server
│   ├── constants.js                 # SEO weights, plan limits, pricing
│   └── helpers.js                   # Pure utility functions
│
├── .env.example                     # Environment variable template
├── .gitignore
└── package.json                     # Root workspace config
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/yourname/antigravity-seo.git
cd antigravity-seo

# Install root dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..

# Install client dependencies
cd client && npm install && cd ..
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:

| Variable              | How to get it                                      |
|-----------------------|----------------------------------------------------|
| `MONGODB_URI`         | [MongoDB Atlas](https://cloud.mongodb.com) — free tier |
| `JWT_SECRET`          | Run: `openssl rand -hex 32`                        |
| `PAGESPEED_API_KEY`   | [Google Cloud Console](https://console.cloud.google.com) → APIs → PageSpeed Insights |
| `ANTHROPIC_API_KEY`   | [console.anthropic.com](https://console.anthropic.com) |

> **Note:** The app works without all keys. PageSpeed and AI features gracefully degrade if keys are missing.

### 3. Run Development Servers

```bash
# From root — starts both server (port 5000) and client (port 5173) together
npm run dev
```

Or separately:

```bash
# Server only
cd server && npm run dev

# Client only
cd client && npm run dev
```

Open `http://localhost:5173`

---

## 🔌 API Reference

### `POST /api/analyze`
Analyze a URL for SEO issues.

**Request:**
```json
{ "url": "https://example.com" }
```

**Response:**
```json
{
  "success": true,
  "report": {
    "url": "https://example.com",
    "score": 67,
    "grade": "Needs Work",
    "issues": [
      {
        "title": "Missing meta description",
        "severity": "critical",
        "category": "meta",
        "description": "No meta description found...",
        "fix": "Add <meta name='description' content='...'> to your <head>.",
        "points": 15
      }
    ],
    "keywords": [{ "word": "example", "count": 12, "relevance": "High" }],
    "speedData": { "performanceScore": 72, "grade": "B", "fcp": 1200, "lcp": 2100 },
    "aiSummary": "Your site has a solid structure but...",
    "aiRecommendations": ["Fix your meta description first...", "..."],
    "pageTitle": "Example Domain",
    "mobileFriendly": true,
    "hasSSL": true
  }
}
```

### `GET /api/reports` *(auth required)*
Returns paginated report history for the logged-in user.

### `POST /api/auth/register`
```json
{ "name": "Priya", "email": "priya@example.com", "password": "securepass" }
```

### `POST /api/auth/login`
```json
{ "email": "priya@example.com", "password": "securepass" }
```

---

## 🎯 SEO Score Calculation

| Check               | Max Points | Logic                                    |
|---------------------|------------|------------------------------------------|
| Title Tag           | 15         | Exists + 50–60 chars                     |
| Meta Description    | 15         | Exists + 150–160 chars                   |
| Page Speed          | 20         | Google PageSpeed score (0–100 → 0–20)    |
| Mobile Friendly     | 15         | Viewport meta tag present                |
| H1 Tag              | 10         | Exactly one H1 found                     |
| Image Alt Text      | 10         | All images have alt attributes           |
| HTTPS / SSL         | 5          | URL starts with https://                 |
| Canonical Tag       | 3          | `<link rel="canonical">` present         |
| Robots Meta         | 2          | Not set to noindex                       |
| **Total**           | **100**    |                                          |

---

## 💰 Monetization Plans

| Feature               | Free    | Pro (₹499/mo) | Agency (₹1,999/mo) |
|-----------------------|---------|----------------|---------------------|
| Scans per day         | 3       | Unlimited       | Unlimited            |
| Report history        | ✗       | 365 days        | 365 days             |
| AI meta rewrites      | ✗       | ✓               | ✓                    |
| PDF export            | ✗       | ✓               | ✓                    |
| Competitor analysis   | ✗       | ✓               | ✓                    |
| White-label reports   | ✗       | ✗               | ✓                    |
| Sub-accounts          | ✗       | ✗               | 10                   |

---

## 🏗 Deployment

### Frontend → Vercel

```bash
cd client
npm run build
# Deploy `dist/` to Vercel — set VITE_API_BASE_URL to your server URL
```

### Backend → Railway / Render

```bash
# Set all env vars in the platform dashboard
# Start command: node index.js
# Root directory: server/
```

### Environment Variables for Production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
PAGESPEED_API_KEY=...
ANTHROPIC_API_KEY=...
CLIENT_URL=https://yourdomain.com
```

---

## 🧪 Testing the API

```bash
# Health check
curl http://localhost:5000/api/health

# Analyze a URL
curl -X POST http://localhost:5000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'
```

---

## 🛣 Roadmap

- [ ] PDF report export
- [ ] Competitor comparison (analyze 2 URLs side by side)
- [ ] Weekly automated re-scan with email digest
- [ ] Chrome extension
- [ ] Stripe payment integration
- [ ] Sitemap.xml validator
- [ ] Backlink count (via Moz / SEMrush API)
- [ ] Historical score chart (Recharts)

---

## 📄 License

MIT — build on it, ship it, make money with it.
