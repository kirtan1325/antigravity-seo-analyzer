// server/services/speedChecker.js
// Google PageSpeed Insights API integration

const axios = require('axios');

const PAGESPEED_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

/**
 * Map PageSpeed score (0–1) to letter grade.
 */
function scoreToGrade(score) {
  if (score >= 0.90) return 'A';
  if (score >= 0.70) return 'B';
  if (score >= 0.50) return 'C';
  if (score >= 0.30) return 'D';
  return 'F';
}

/**
 * Fetch PageSpeed data for both mobile and desktop.
 * Returns merged speed metrics.
 */
async function checkSpeed(url) {
  const apiKey = process.env.PAGESPEED_API_KEY;

  if (!apiKey) {
    console.warn('⚠  PAGESPEED_API_KEY not set — skipping speed check');
    return null;
  }

  try {
    // Run mobile (most important for Google's ranking)
    const res = await axios.get(PAGESPEED_URL, {
      params: {
        url,
        key:      apiKey,
        strategy: 'mobile',
        category: 'performance',
      },
      timeout: 30000,  // PageSpeed can be slow
    });

    const categories  = res.data.lighthouseResult?.categories || {};
    const audits      = res.data.lighthouseResult?.audits || {};

    const performanceScore = Math.round((categories.performance?.score || 0) * 100);

    return {
      performanceScore,
      grade: scoreToGrade(categories.performance?.score || 0),

      // Core Web Vitals
      fcp:  Math.round(audits['first-contentful-paint']?.numericValue  || 0),
      lcp:  Math.round(audits['largest-contentful-paint']?.numericValue || 0),
      tbt:  Math.round(audits['total-blocking-time']?.numericValue      || 0),
      cls:  +(audits['cumulative-layout-shift']?.numericValue           || 0).toFixed(3),
      speedIndex: Math.round(audits['speed-index']?.numericValue        || 0),

      // Top opportunities (sorted by savings)
      opportunities: Object.values(audits)
        .filter(a => a.details?.type === 'opportunity' && a.numericValue > 0)
        .sort((a, b) => (b.numericValue || 0) - (a.numericValue || 0))
        .slice(0, 5)
        .map(a => ({
          id:          a.id,
          title:       a.title,
          description: a.description,
          savingsMs:   Math.round(a.numericValue || 0),
        })),
    };
  } catch (err) {
    // Non-fatal: log and return null so analysis still completes
    console.error('PageSpeed API error:', err.response?.data?.error?.message || err.message);
    return null;
  }
}

module.exports = { checkSpeed };
