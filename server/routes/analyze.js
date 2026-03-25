// server/routes/analyze.js
const express   = require('express');
const router    = express.Router();
const validator = require('validator');

const { analyzeSEO }       = require('../services/seoAnalyzer');
const { checkSpeed }        = require('../services/speedChecker');
const { generateAISummary } = require('../services/aiSuggestions');
const { calculateScore }    = require('../services/seoAnalyzer');
const { normaliseURL, extractDomain, getScoreGrade } = require('../shared/helpers');
const { clamp }             = require('../shared/helpers');
const Report                = require('../models/Report');
const authMiddleware        = require('../middleware/auth');

// ─── POST /api/analyze ────────────────────────────────────────────────────
// Protected endpoint — requires login to map usage to specific subscriptons
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    let { url } = req.body;

    // ── Validate URL ───────────────────────────────────────────────────
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL is required.' });
    }

    url = normaliseURL(url.trim());

    if (!url || !validator.isURL(url, { protocols: ['http', 'https'] })) {
      return res.status(400).json({ error: 'Please provide a valid URL (e.g. https://example.com).' });
    }

    // ── Check plan limits for users ──────────────────────────────────
    const userId = req.userId;
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (user && !user.canScan()) {
      return res.status(429).json({
        error: 'Daily scan limit reached.',
        upgradeUrl: '/pricing',
        plan: user.plan,
      });
    }
    
    if (user) await user.incrementScan();

    // ── Run analysis in parallel ───────────────────────────────────────
    const [seoResult, speedData] = await Promise.all([
      analyzeSEO(url),
      checkSpeed(url),
    ]);

    // ── Recalculate score with speed data ─────────────────────────────
    // Inject actual speed score into the result
    let finalScore = seoResult.score;
    if (speedData) {
      // Replace the estimated speed score with real one
      const speedBonus = Math.round((speedData.performanceScore / 100) * 20);
      // Remove placeholder speed points (10 partial) and add real ones
      finalScore = clamp(finalScore - 10 + speedBonus, 0, 100);
    }

    // ── Generate AI summary ───────────────────────────────────────────
    const { PLAN_LIMITS } = require('../shared/constants');
    let aiResult = { summary: null, recommendations: [] };
    
    // Only generate AI if plan allows it
    if (user && PLAN_LIMITS[user.plan]?.aiSuggestions) {
      try {
        aiResult = await generateAISummary({
          url,
          score:     finalScore,
          issues:    seoResult.issues,
          pageTitle: seoResult.pageTitle,
          keywords:  seoResult.keywords,
          wordCount: seoResult.wordCount,
        });
      } catch (err) {
        console.error('AI Generation Failed:', err.message);
      }
    }

    // ── Add speed issue to issues list ────────────────────────────────
    if (speedData) {
      // Speed issue was a placeholder — now replace with real data
      const speedIssueIdx = seoResult.issues.findIndex(i => i.category === 'speed');
      const realSpeedIssue = {
        title:       `Page speed: ${speedData.performanceScore}/100 (Grade ${speedData.grade})`,
        severity:    speedData.performanceScore >= 70 ? 'good' : speedData.performanceScore >= 50 ? 'warning' : 'critical',
        category:    'speed',
        description: `Google PageSpeed score of ${speedData.performanceScore}. LCP: ${(speedData.lcp / 1000).toFixed(1)}s, CLS: ${speedData.cls}.`,
        fix:         speedData.opportunities.length
          ? `Top fix: ${speedData.opportunities[0]?.title} (saves ~${speedData.opportunities[0]?.savingsMs}ms)`
          : 'Enable Gzip compression, use a CDN, and lazy-load images.',
        points:      speedData.performanceScore < 70 ? 20 - Math.round((speedData.performanceScore / 100) * 20) : 0,
      };
      if (speedIssueIdx >= 0) seoResult.issues[speedIssueIdx] = realSpeedIssue;
      else seoResult.issues.push(realSpeedIssue);
    }

    // ── Sort Issues by Fix Priority ─────────────────────────────────────
    // Descending order: highest points (biggest impact) first
    seoResult.issues.sort((a, b) => b.points - a.points);

    // ── Map Impact to Label ───────────────────────────────────────────
    seoResult.issues = seoResult.issues.map(issue => ({
      ...issue,
      impact: issue.severity === 'critical' ? 'High' : issue.severity === 'warning' ? 'Medium' : 'Low',
    }));

    // ── Build final response ──────────────────────────────────────────
    const grade = getScoreGrade(finalScore);
    const report = {
      url,
      domain:           extractDomain(url),
      score:            finalScore,
      grade:            grade.label,
      issues:           seoResult.issues,
      // Priority fix list: first 3 critical/high-impact issues
      priorityFixes:    seoResult.issues.filter(i => i.severity !== 'good').slice(0, 3),
      keywords:         seoResult.keywords,
      speedData:        speedData || null,
      pageTitle:        seoResult.pageTitle,
      metaDescription:  seoResult.metaDescription,
      h1:               seoResult.h1,
      wordCount:        seoResult.wordCount,
      mobileFriendly:   seoResult.mobileFriendly,
      hasSSL:           seoResult.hasSSL,
      hasCanonical:     seoResult.hasCanonical,
      hasRobots:        seoResult.hasRobots,
      imagesTotalCount: seoResult.imagesTotalCount,
      imagesWithoutAlt: seoResult.imagesWithoutAlt,
      internalLinks:    seoResult.internalLinks,
      externalLinks:    seoResult.externalLinks,
      aiSummary:            aiResult.summary,
      aiRecommendations:    aiResult.recommendations || [],
      analysisTime:         seoResult.analysisTime,
      createdAt:            new Date().toISOString(),
    };

    // ── Persist to DB if connected ────────────────────────────────────
    try {
      const saved = await Report.create({ ...report, userId: userId || null });
      report.reportId = saved._id;
    } catch (_) {
      // DB might be offline — return result anyway
    }

    res.json({ success: true, report, scansToday: user ? user.scansToday : undefined });

  } catch (err) {
    // Common user-facing errors
    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
      return res.status(400).json({ error: 'Could not reach that URL. Is the website online?' });
    }
    if (err.response?.status === 403) {
      return res.status(400).json({ error: 'That website blocked our crawler.' });
    }
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
      return res.status(400).json({ error: 'Website took too long to respond (timeout).' });
    }
    next(err);
  }
});

module.exports = router;
