// client/src/pages/Dashboard.jsx
import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAnalysisStore, useAuthStore } from '../utils/store.js';
import ScoreGauge   from '../components/ScoreGauge.jsx';
import IssueCard    from '../components/IssueCard.jsx';
import FixPanel     from '../components/FixPanel.jsx';
import MiniScoreBar from '../components/MiniScoreBar.jsx';
import { formatDate, extractDomain } from "../../../server/shared/helpers.js";

export default function Dashboard() {
  const { report, reset } = useAnalysisStore();
  const navigate = useNavigate();

  // Redirect if no report in state
  useEffect(() => {
    if (!report) navigate('/');
  }, [report, navigate]);

  if (!report) return null;

  const criticalCount = report.issues?.filter(i => i.severity === 'critical').length || 0;
  const warningCount  = report.issues?.filter(i => i.severity === 'warning').length  || 0;
  const goodCount     = report.issues?.filter(i => i.severity === 'good').length     || 0;

  function handleDownloadJSON() {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `seo-report-${extractDomain(report.url)}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* ── Top Bar ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-gray-400">Analyzing</span>
              <a
                href={report.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-brand hover:underline truncate max-w-xs"
              >
                {extractDomain(report.url)}
              </a>
            </div>
            {report.createdAt && (
              <p className="text-xs text-gray-400 font-mono mt-0.5">
                Report generated {formatDate(report.createdAt)}
                {report.analysisTime && ` · ${(report.analysisTime / 1000).toFixed(1)}s`}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                if (useAuthStore.getState().user?.plan !== 'pro' && useAuthStore.getState().user?.plan !== 'agency') {
                  alert('Exporting reports is available on Pro and Agency plans. Please upgrade!');
                  navigate('/pricing');
                  return;
                }
                handleDownloadJSON();
              }}
              className="text-xs border border-gray-200 bg-white flex items-center gap-1.5 text-gray-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg font-mono transition-colors"
            >
              {useAuthStore.getState().user?.plan === 'free' ? '🔒' : '↓'} Export JSON
            </button>
            <button
              onClick={() => { reset(); navigate('/'); }}
              className="text-xs bg-brand text-white px-3 py-1.5 rounded-lg font-mono hover:bg-brand-dark transition-colors"
            >
              ← New Analysis
            </button>
          </div>
        </div>

        {/* ── Score Hero Card ───────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 mb-6 animate-slide-up">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

            {/* Gauge */}
            <div className="shrink-0">
              <ScoreGauge score={report.score} size={160} />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="font-heading font-extrabold text-2xl mb-1">
                {report.grade} SEO Health
              </h1>
              <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
                {report.aiSummary}
              </p>

              {/* Mini scores */}
              <MiniScoreBar report={report} />

              {/* Issue count pills */}
              <div className="flex flex-wrap gap-2 mt-4 justify-center sm:justify-start">
                <span className="font-mono text-xs bg-red-50 text-red-600 border border-red-100 px-3 py-1 rounded-full">
                  {criticalCount} critical
                </span>
                <span className="font-mono text-xs bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1 rounded-full">
                  {warningCount} warnings
                </span>
                <span className="font-mono text-xs bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-full">
                  {goodCount} passed
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Page Meta Info ────────────────────────────────────────── */}
        {(report.pageTitle || report.metaDescription) && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-3">
              📄 Current Meta Tags
            </p>
            <div className="space-y-3">
              {report.pageTitle && (
                <div>
                  <p className="text-[10px] font-mono text-gray-400 mb-0.5">Title ({report.pageTitle.length} chars)</p>
                  <p className="text-sm font-medium text-blue-700 hover:underline cursor-pointer leading-snug">
                    {report.pageTitle}
                  </p>
                </div>
              )}
              {report.metaDescription && (
                <div>
                  <p className="text-[10px] font-mono text-gray-400 mb-0.5">Description ({report.metaDescription.length} chars)</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{report.metaDescription}</p>
                </div>
              )}
              {report.h1 && (
                <div>
                  <p className="text-[10px] font-mono text-gray-400 mb-0.5">H1 Heading</p>
                  <p className="text-sm font-semibold text-gray-800">{report.h1}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Main Content: Issues + Side Panel ─────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Issues list */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-heading font-bold text-lg">
                Issues Found
                <span className="ml-2 font-mono text-sm text-gray-400 font-normal">
                  ({report.issues?.length || 0})
                </span>
              </h2>
              {/* Filter hint */}
              <p className="text-xs font-mono text-gray-400 hidden sm:block">
                Click any issue to expand fix
              </p>
            </div>

            <div className="space-y-2.5">
              {/* Sort: critical first, then warning, then good */}
              {[...( report.issues || [])]
                .sort((a, b) => {
                  const order = { critical: 0, warning: 1, good: 2 };
                  return order[a.severity] - order[b.severity];
                })
                .map((issue, i) => (
                  <IssueCard key={i} issue={issue} index={i} />
                ))
              }
            </div>
          </div>

          {/* Side panel */}
          <div className="lg:col-span-1">
            <FixPanel report={report} />
          </div>
        </div>

        {/* ── Speed Details (if available) ───────────────────────────── */}
        {report.speedData && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mt-6">
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-4">
              ⚡ Core Web Vitals
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Performance',  value: `${report.speedData.performanceScore}/100`, ok: report.speedData.performanceScore >= 70 },
                { label: 'FCP',          value: `${(report.speedData.fcp  / 1000).toFixed(1)}s`, ok: report.speedData.fcp  < 1800 },
                { label: 'LCP',          value: `${(report.speedData.lcp  / 1000).toFixed(1)}s`, ok: report.speedData.lcp  < 2500 },
                { label: 'CLS',          value: `${report.speedData.cls}`,                        ok: report.speedData.cls  < 0.1  },
              ].map(({ label, value, ok }) => (
                <div key={label} className={`rounded-xl p-3 text-center border ${ok ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                  <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className={`font-heading font-bold text-xl mt-0.5 ${ok ? 'text-green-700' : 'text-red-600'}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA: Sign up / Upgrade ────────────────────────────────────── */}
        {!useAuthStore.getState().user ? (
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-brand to-purple-600 p-6 text-white text-center">
            <h3 className="font-heading font-bold text-lg mb-1">Save this report & track your progress</h3>
            <p className="text-white/70 text-sm mb-4">Sign up free to keep your history, compare scores over time, and get weekly re-scans.</p>
            <Link
              to="/history"
              className="inline-block bg-white text-brand font-heading font-bold px-6 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-sm"
            >
              Create Free Account →
            </Link>
          </div>
        ) : useAuthStore.getState().user?.plan === 'free' ? (
          <div className="mt-6 rounded-2xl bg-gradient-to-r from-brand to-purple-600 p-6 text-white text-center">
            <h3 className="font-heading font-bold text-lg mb-1">Unlock AI Insights & Unlimited Scans!</h3>
            <p className="text-white/70 text-sm mb-4">Your current Free plan limits. Upgrade to Pro to bypass limitations and get priority support.</p>
            <Link
              to="/pricing"
              className="inline-block bg-white text-brand font-heading font-bold px-6 py-2.5 rounded-xl hover:bg-gray-100 transition-colors text-sm"
            >
              Upgrade to Pro →
            </Link>
          </div>
        ) : null}

      </div>
    </div>
  );
}
