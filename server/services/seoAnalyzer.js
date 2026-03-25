// server/services/seoAnalyzer.js
// Core HTML parsing + SEO scoring engine

const axios = require("axios");
const cheerio = require("cheerio");
const { SEO_WEIGHTS, SEVERITY } = require("../shared/constants.js");
const { clamp } = require("../shared/helpers.js");

// ─── Fetch page HTML ───────────────────────────────────────────────────────
async function fetchPage(url) {
  const res = await axios.get(url, {
    timeout: 10000,
    maxRedirects: 5,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      Connection: "keep-alive",
    },
  });
  return { html: res.data, finalUrl: res.request.res?.responseUrl || url };
}

// ─── Parse all SEO signals from HTML ──────────────────────────────────────
function parsePage(html, url) {
  const $ = cheerio.load(html);

  // Meta
  const title = $("title").first().text().trim();
  const metaDesc = $('meta[name="description"]').attr("content")?.trim() || "";
  const canonical = $('link[rel="canonical"]').attr("href") || "";
  const robotsMeta = $('meta[name="robots"]').attr("content") || "";
  const ogTitle = $('meta[property="og:title"]').attr("content") || "";
  const ogDesc = $('meta[property="og:description"]').attr("content") || "";

  // Headings
  const h1s = $("h1")
    .map((_i, el) => $(el).text().trim())
    .get();
  const h2s = $("h2")
    .map((_i, el) => $(el).text().trim())
    .get();
  const h3s = $("h3")
    .map((_i, el) => $(el).text().trim())
    .get();

  // Images
  const allImages = $("img");
  const imagesWithoutAlt = $('img:not([alt]), img[alt=""]');

  // Links
  let internalLinks = 0,
    externalLinks = 0;
  const parsedHost = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return "";
    }
  })();
  $("a[href]").each((_i, el) => {
    const href = $(el).attr("href") || "";
    if (href.startsWith("/") || href.includes(parsedHost)) internalLinks++;
    else if (href.startsWith("http")) externalLinks++;
  });

  // Text content
  $("script, style, nav, footer, header").remove();
  const bodyText = $("body").text().replace(/\s+/g, " ").trim();
  const wordCount = bodyText ? bodyText.split(" ").filter(Boolean).length : 0;

  // Structured data
  const hasSchema = $('script[type="application/ld+json"]').length > 0;

  // SSL
  const hasSSL = url.startsWith("https://");

  // Viewport (mobile)
  const hasViewport = $('meta[name="viewport"]').length > 0;

  return {
    title,
    metaDesc,
    canonical,
    robotsMeta,
    ogTitle,
    ogDesc,
    h1s,
    h2s,
    h3s,
    imageCount: allImages.length,
    imagesWithoutAlt: imagesWithoutAlt.length,
    internalLinks,
    externalLinks,
    wordCount,
    bodyText,
    hasSchema,
    hasSSL,
    hasViewport,
  };
}

// ─── Extract top keywords from body text ──────────────────────────────────
function extractKeywords(bodyText, title, metaDesc) {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "from",
    "up",
    "about",
    "into",
    "through",
    "during",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "being",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "shall",
    "can",
    "need",
    "this",
    "that",
    "these",
    "those",
    "it",
    "its",
    "we",
    "our",
    "you",
    "your",
    "they",
    "their",
    "he",
    "she",
    "him",
    "her",
    "his",
    "hers",
    "us",
    "me",
    "my",
    "i",
    "not",
    "no",
    "so",
  ]);

  const combined = `${title} ${metaDesc} ${bodyText}`.toLowerCase();
  const words = combined.match(/\b[a-z]{4,}\b/g) || [];

  const freq = {};
  words.forEach((w) => {
    if (!stopWords.has(w)) freq[w] = (freq[w] || 0) + 1;
  });

  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8)
    .map(([word, count]) => ({
      word,
      count,
      relevance: count > 10 ? "High" : count > 4 ? "Medium" : "Low",
    }));
}

// ─── Calculate SEO score and build issue list ──────────────────────────────
function calculateScore(data, speedScore) {
  const issues = [];
  let score = 0;

  // ── Title Tag (15pts) ──────────────────────────────────────────────────
  if (!data.title) {
    issues.push({
      title: "Missing title tag",
      severity: SEVERITY.CRITICAL,
      category: "meta",
      description:
        "Your page has no <title> tag. This is the single most important on-page SEO element.",
      fix: "Add <title>Your Primary Keyword – Brand Name</title> inside your <head>. Keep it 50–60 characters.",
      points: 15,
    });
  } else if (data.title.length < 30) {
    score += 8;
    issues.push({
      title: `Title too short (${data.title.length} chars)`,
      severity: SEVERITY.WARNING,
      category: "meta",
      description: `Your title "${data.title}" is too short. Search engines show up to 60 chars — use them.`,
      fix: "Expand your title to 50–60 characters. Include your main keyword near the start.",
      points: 7,
    });
  } else if (data.title.length > 65) {
    score += 10;
    issues.push({
      title: `Title too long (${data.title.length} chars)`,
      severity: SEVERITY.WARNING,
      category: "meta",
      description:
        "Google will truncate your title in search results, cutting off important keywords.",
      fix: "Shorten your title to under 60 characters. Put the most important keyword first.",
      points: 5,
    });
  } else {
    score += SEO_WEIGHTS.titleTag;
    issues.push({
      title: `Title tag looks good (${data.title.length} chars)`,
      severity: SEVERITY.GOOD,
      category: "meta",
      description: `"${data.title}" is within the ideal 50–60 character range.`,
      fix: "No action needed. Keep your title relevant and keyword-rich.",
      points: 0,
    });
  }

  // ── Meta Description (15pts) ──────────────────────────────────────────
  if (!data.metaDesc) {
    issues.push({
      title: "Missing meta description",
      severity: SEVERITY.CRITICAL,
      category: "meta",
      description:
        "No meta description found. Google may auto-generate one from your page content, which is often poor.",
      fix: 'Add <meta name="description" content="Your description here (150–160 chars)"> to your <head>.',
      points: 15,
    });
  } else if (data.metaDesc.length < 100) {
    score += 8;
    issues.push({
      title: `Meta description too short (${data.metaDesc.length} chars)`,
      severity: SEVERITY.WARNING,
      category: "meta",
      description:
        "Your meta description is too short. You have space to convince searchers to click your result.",
      fix: "Expand to 150–160 characters. Include your main keyword and a clear call to action.",
      points: 7,
    });
  } else if (data.metaDesc.length > 170) {
    score += 10;
    issues.push({
      title: `Meta description too long (${data.metaDesc.length} chars)`,
      severity: SEVERITY.WARNING,
      category: "meta",
      description: "Your meta description will be cut off in search results.",
      fix: "Trim to under 160 characters. Keep the most important info at the start.",
      points: 5,
    });
  } else {
    score += SEO_WEIGHTS.metaDescription;
    issues.push({
      title: "Meta description is good",
      severity: SEVERITY.GOOD,
      category: "meta",
      description: `${data.metaDesc.length} characters — within the ideal 150–160 range.`,
      fix: "No action needed. Ensure it contains your target keyword naturally.",
      points: 0,
    });
  }

  // ── H1 Tag (10pts) ────────────────────────────────────────────────────
  if (data.h1s.length === 0) {
    issues.push({
      title: "No H1 heading found",
      severity: SEVERITY.CRITICAL,
      category: "content",
      description:
        "Your page has no H1 tag. Search engines use H1 to understand what your page is about.",
      fix: "Add exactly one <h1> tag with your primary keyword. It should be the main headline visitors see first.",
      points: 10,
    });
  } else if (data.h1s.length > 1) {
    score += 5;
    issues.push({
      title: `Multiple H1 tags found (${data.h1s.length})`,
      severity: SEVERITY.WARNING,
      category: "content",
      description:
        "Having multiple H1 tags confuses search engines about which is the main topic.",
      fix: "Keep only one H1. Change other headings to H2 or H3.",
      points: 5,
    });
  } else {
    score += SEO_WEIGHTS.h1Tag;
    issues.push({
      title: "H1 heading present",
      severity: SEVERITY.GOOD,
      category: "content",
      description: `Found: "${data.h1s[0]?.slice(0, 60)}${data.h1s[0]?.length > 60 ? "…" : ""}"`,
      fix: "Ensure your H1 naturally includes your primary keyword.",
      points: 0,
    });
  }

  // ── Image Alt Text (10pts) ────────────────────────────────────────────
  if (data.imageCount > 0) {
    if (data.imagesWithoutAlt === 0) {
      score += SEO_WEIGHTS.altText;
      issues.push({
        title: "All images have alt text",
        severity: SEVERITY.GOOD,
        category: "content",
        description: `All ${data.imageCount} images have alt attributes.`,
        fix: "Keep writing descriptive alt text. Include keywords where natural.",
        points: 0,
      });
    } else {
      const proportion = data.imagesWithoutAlt / data.imageCount;
      score += proportion < 0.3 ? 7 : proportion < 0.6 ? 4 : 0;
      issues.push({
        title: `${data.imagesWithoutAlt} image(s) missing alt text`,
        severity: proportion > 0.5 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
        category: "content",
        description: `${data.imagesWithoutAlt} of ${data.imageCount} images have no alt attribute. This hurts accessibility and image search rankings.`,
        fix: 'Add descriptive alt text to every image: <img src="..." alt="describe what is in the image">. Include keywords where they fit naturally.',
        points:
          SEO_WEIGHTS.altText -
          (proportion < 0.3 ? 7 : proportion < 0.6 ? 4 : 0),
      });
    }
  }

  // ── Page Speed (20pts) ────────────────────────────────────────────────
  if (speedScore != null) {
    const speedPts = Math.round((speedScore / 100) * SEO_WEIGHTS.pageSpeed);
    score += speedPts;
    const speedGrade =
      speedScore >= 90
        ? "A"
        : speedScore >= 70
          ? "B"
          : speedScore >= 50
            ? "C"
            : "D";
    issues.push({
      title: `Page speed score: ${speedScore}/100 (Grade ${speedGrade})`,
      severity:
        speedScore >= 70
          ? SEVERITY.GOOD
          : speedScore >= 50
            ? SEVERITY.WARNING
            : SEVERITY.CRITICAL,
      category: "speed",
      description: `Google PageSpeed score of ${speedScore}. ${speedScore < 70 ? "Slow pages rank lower and lose visitors." : "Good loading performance."}`,
      fix:
        speedScore < 70
          ? "Compress images (use WebP), enable browser caching, minify CSS/JS, and consider a CDN like Cloudflare."
          : "Maintain current performance. Consider lazy-loading below-fold images.",
      points: SEO_WEIGHTS.pageSpeed - speedPts,
    });
  } else {
    score += 10; // partial credit when speed unavailable
  }

  // ── Mobile / Viewport (15pts) ─────────────────────────────────────────
  if (!data.hasViewport) {
    issues.push({
      title: "Not mobile-friendly (no viewport meta)",
      severity: SEVERITY.CRITICAL,
      category: "technical",
      description:
        "Missing viewport meta tag means your site will look broken on phones. Google uses mobile-first indexing.",
      fix: 'Add <meta name="viewport" content="width=device-width, initial-scale=1"> to your <head>.',
      points: 15,
    });
  } else {
    score += SEO_WEIGHTS.mobileFriendly;
    issues.push({
      title: "Mobile viewport configured",
      severity: SEVERITY.GOOD,
      category: "technical",
      description:
        "Viewport meta tag is present — mobile users will see a correctly scaled page.",
      fix: "Test on real devices or Google's Mobile-Friendly Test to confirm layouts look good.",
      points: 0,
    });
  }

  // ── HTTPS / SSL (5pts) ────────────────────────────────────────────────
  if (!data.hasSSL) {
    issues.push({
      title: "No HTTPS / SSL certificate",
      severity: SEVERITY.CRITICAL,
      category: "technical",
      description:
        'Your site is on HTTP, not HTTPS. Google marks these as "Not Secure" and ranks them lower.',
      fix: "Install a free SSL certificate via Let's Encrypt, or enable HTTPS through your hosting provider (Cloudflare, cPanel).",
      points: 5,
    });
  } else {
    score += SEO_WEIGHTS.httpsSSL;
    issues.push({
      title: "HTTPS enabled",
      severity: SEVERITY.GOOD,
      category: "technical",
      description:
        "Your site uses HTTPS — good for security, trust, and rankings.",
      fix: "Ensure all internal links use https:// (no mixed content warnings).",
      points: 0,
    });
  }

  // ── Canonical Tag (3pts) ──────────────────────────────────────────────
  if (!data.canonical) {
    score += 0;
    issues.push({
      title: "No canonical tag",
      severity: SEVERITY.WARNING,
      category: "technical",
      description:
        "Without a canonical tag, Google might index duplicate versions of your page (with/without www, trailing slash, etc.).",
      fix: 'Add <link rel="canonical" href="https://yoursite.com/this-page/"> to your <head>.',
      points: 3,
    });
  } else {
    score += SEO_WEIGHTS.canonical;
  }

  // ── Robots meta (2pts) ────────────────────────────────────────────────
  if (data.robotsMeta.toLowerCase().includes("noindex")) {
    issues.push({
      title: "Page is set to NOINDEX",
      severity: SEVERITY.CRITICAL,
      category: "technical",
      description:
        "Your page has a noindex directive — Google will NOT show this page in search results!",
      fix: 'Remove or change the robots meta tag to <meta name="robots" content="index, follow"> unless you intentionally want to hide this page.',
      points: 10,
    });
  } else {
    score += SEO_WEIGHTS.robots;
  }

  // ── Word Count ────────────────────────────────────────────────────────
  if (data.wordCount < 300) {
    issues.push({
      title: `Thin content (${data.wordCount} words)`,
      severity: SEVERITY.WARNING,
      category: "content",
      description:
        "Pages with very little content tend to rank poorly. Google favours comprehensive content.",
      fix: "Aim for at least 600–800 words for blog posts or service pages. Add more value: examples, FAQs, statistics.",
      points: 8,
    });
  } else if (data.wordCount > 500) {
    issues.push({
      title: `Good content length (${data.wordCount} words)`,
      severity: SEVERITY.GOOD,
      category: "content",
      description:
        "Your page has enough content for search engines to understand the topic.",
      fix: "Keep content fresh. Update posts periodically to maintain rankings.",
      points: 0,
    });
  }

  // ── Schema Markup ─────────────────────────────────────────────────────
  if (!data.hasSchema) {
    issues.push({
      title: "No structured data (Schema.org)",
      severity: SEVERITY.WARNING,
      category: "technical",
      description:
        "No JSON-LD schema found. Schema markup helps Google show rich results (star ratings, FAQs, events) in search.",
      fix: "Add relevant Schema.org markup. For a blog: Article schema. For a business: LocalBusiness schema. Use Google's Structured Data Markup Helper.",
      points: 5,
    });
  }

  return {
    score: clamp(Math.round(score), 0, 100),
    issues,
  };
}

// ─── Main analysis function ────────────────────────────────────────────────
async function analyzeSEO(url) {
  const start = Date.now();

  const { html } = await fetchPage(url);
  const data = parsePage(html, url);
  const keywords = extractKeywords(data.bodyText, data.title, data.metaDesc);

  // Speed score may be injected externally (from speedChecker.js)
  // Pass null here — caller can enrich the result
  const { score, issues } = calculateScore(data, null);

  return {
    score,
    issues,
    keywords,
    pageTitle: data.title,
    metaDescription: data.metaDesc,
    h1: data.h1s[0] || "",
    wordCount: data.wordCount,
    mobileFriendly: data.hasViewport,
    hasSSL: data.hasSSL,
    hasCanonical: !!data.canonical,
    hasRobots: !data.robotsMeta.includes("noindex"),
    imagesTotalCount: data.imageCount,
    imagesWithoutAlt: data.imagesWithoutAlt,
    internalLinks: data.internalLinks,
    externalLinks: data.externalLinks,
    analysisTime: Date.now() - start,
  };
}

module.exports = { analyzeSEO, parsePage, calculateScore, extractKeywords };
