// server/services/aiSuggestions.js
// Anthropic Claude — plain-English SEO recommendations

const Anthropic = require('@anthropic-ai/sdk');

let client;
function getClient() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

/**
 * Generate a short plain-English summary + top 3 recommendations.
 */
async function generateAISummary({ url, score, issues, pageTitle, keywords, wordCount }) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return {
      summary: `Your site scored ${score}/100. ${score < 50 ? 'Several critical issues need attention.' : score < 75 ? 'Good foundation with room to improve.' : 'Strong SEO setup — keep it up!'}`,
      recommendations: [],
    };
  }

  const criticals = issues.filter(i => i.severity === 'critical').map(i => i.title);
  const warnings  = issues.filter(i => i.severity === 'warning').map(i => i.title);

  const prompt = `You are a friendly SEO expert for a new website owner (imagine explaining like they're 10 years old). 
Website: ${url}
Current Score: ${score}/100 
Errors Found: ${criticals.join('; ') || 'None!'}
Warnings: ${warnings.join('; ') || 'None'}

Please provide:
1. A very simple overview: How is the website doing? 
2. The BIGGEST problem to fix first and WHY it matters for traffic.
3. Two other simple things to fix right now.

Use:
- Simple language (NO complex SEO jargon like 'canonical' or 'crawler' without a simple explanation)
- Encouraging tone
- Action-oriented instructions ('Change this title', 'Add this image tag')

Return only a JSON object:
{
  "summary": "...",
  "recommendations": ["...", "...", "..."],
  "priorityFix": "..."
}`;

  try {
    const msg = await getClient().messages.create({
      model:      'claude-3-haiku-20240307',  // Fast + cheap for summaries
      max_tokens: 400,
      messages:   [{ role: 'user', content: prompt }],
    });

    const text = msg.content[0]?.text || '';
    const json = text.replace(/```json|```/g, '').trim();
    return JSON.parse(json);
  } catch (err) {
    console.error('AI summary error:', err.message);
    // Graceful fallback
    return {
      summary: `Your site scored ${score}/100. ${criticals.length} critical issue(s) found that are directly impacting your search rankings.`,
      recommendations: criticals.slice(0, 3).map(c => `Fix: ${c}`),
    };
  }
}

/**
 * Generate an improved meta title + description for a given page.
 */
async function rewriteMetaTags({ url, currentTitle, currentDesc, keywords, h1 }) {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  const prompt = `Rewrite this page's meta title and description for better SEO.

URL: ${url}
Current Title: ${currentTitle || 'None'}
Current Meta Description: ${currentDesc || 'None'}
H1: ${h1 || 'None'}
Main Keywords: ${keywords.slice(0, 5).map(k => k.word).join(', ')}

Rules:
- Title: 50-60 characters, include primary keyword near the start
- Description: 150-160 characters, include keyword, end with a CTA
- Sound human and compelling, not robotic

Return JSON only:
{
  "title": "...",
  "description": "..."
}`;

  try {
    const msg = await getClient().messages.create({
      model:      'claude-3-haiku-20240307',
      max_tokens: 300,
      messages:   [{ role: 'user', content: prompt }],
    });

    const text = msg.content[0]?.text || '';
    const json = text.replace(/```json|```/g, '').trim();
    return JSON.parse(json);
  } catch (err) {
    console.error('AI meta rewrite error:', err.message);
    return null;
  }
}

module.exports = { generateAISummary, rewriteMetaTags };
