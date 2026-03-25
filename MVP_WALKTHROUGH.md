# ⚙️ Antigravity SEO Analyzer — MVP Implementation Walkthrough

This document shows you exactly how to implement the core "Business Engine" of your SaaS.

---

## 🏗️ 1. Backend Route Gating (Plan Checking)

In `server/routes/analyze.js`, we implement the limit check for different plans.

```javascript
router.post('/api/analyze', optionalAuth, async (req, res) => {
  const { url } = req.body;
  const user = req.user; // Set by optionalAuth middleware

  // 1. IP-based limit for anonymous (guests)
  if (!user) {
    // Basic rate limit via express-rate-limit
    return next(); // Handled by middleware
  }

  // 2. Auth-based limit for Free vs Pro
  const limit = PLAN_LIMITS[user.plan].scansPerDay;
  if (limit !== -1 && user.scansToday >= limit) {
    return res.status(429).json({ 
       error: 'Daily limit reached!', 
       upgradeUrl: '/pricing' 
    });
  }

  // 3. Process scan...
  const result = await runAudit(url);
  
  // 4. Record usage
  user.scansToday += 1;
  await user.save();

  res.json(result);
});
```

---

## 🤖 2. Claude AI Optimization (10-Year-Old Mode)

The key to retention is making technical SEO sound easy. Use this prompt logic:

```javascript
/* Simple explanation prompt logic */
const userFacingExplanation = (technicalTerm) => {
  const explanations = {
    'Canonical': 'Tell Google which page is the original one so it doesn\'t get confused.',
    'Sitemap': 'A map for Google so it can find all your pages easily.',
    'SSL': 'A digital lock that keeps your visitors safe.'
  };
  return explanations[technicalTerm] || technicalTerm;
};
```

---

## 🎨 3. UI/UX: The "High Impact" Dashboard

Your frontend (`ScoreCircle.jsx`) should use the `score-ring` class for impact.

```jsx
// Frontend: Circular Score Gauge
const ScoreCircle = ({ score }) => {
  const color = score >= 80 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';
  
  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-48 h-48 transform -rotate-90">
         <circle /* Background circle */
            className="text-gray-200" 
            strokeWidth="8" stroke="currentColor" fill="transparent" r="70" cx="96" cy="96"
         />
         <circle /* Animated ring */
            className="score-ring"
            style={{ 
              strokeDasharray: '440', 
              strokeDashoffset: (440 - (440 * score) / 100) 
            }}
            strokeDashcap="round" strokeWidth="10" stroke={color} fill="transparent" r="70" cx="96" cy="96"
         />
      </svg>
      <span className="absolute text-5xl font-bold font-syne" style={{ color }}>{score}</span>
    </div>
  );
};
```

---

## 💰 4. Subscription API Response (Frontend)

When a free user hits a Pro feature, show a "Feature Teaser" instead of just an error.

```javascript
// If result.isProOnly is true on frontend, show a blurred box
{report.aiSummary ? (
  <div className="p-4">{report.aiSummary}</div>
) : (
  <div className="p-4 bg-gray-100 blur-sm select-none">
     This amazing AI summary is only for Pro users... [Upgrade Button]
  </div>
)}
```

---

## 🚀 5. Growth strategy: The "Viral Loop"

Enable a "Share Result" button that generates a beautiful social card image (OG image).
*   **Text**: "My website scored 88/100 on Antigravity SEO! Can yours beat it?"
*   **Result**: 5x more organic referrals.
