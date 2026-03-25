import { useAuthStore } from '../utils/store.js';

export default function FixPanel({ report }) {
  if (!report) return null;

  const { aiSummary, aiRecommendations = [], score, keywords = [] } = report;

  // Priority fixes = critical issues sorted by impact
  const criticalFixes = (report.issues || [])
    .filter(i => i.severity === 'critical')
    .slice(0, 3);

  const potentialGain = criticalFixes.reduce((sum, i) => sum + (i.points || 0), 0);

  return (
    <div className="space-y-4">

      {/* Score improvement potential */}
      {potentialGain > 0 && (
        <div className="rounded-2xl bg-brand text-white p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest opacity-70 mb-1">
            ✦ Potential gain
          </p>
          <p className="font-heading font-bold text-3xl">
            +{potentialGain} pts
          </p>
          <p className="text-sm opacity-80 mt-1">
            Fix {criticalFixes.length} critical issues to jump to ~{Math.min(score + potentialGain, 100)}/100
          </p>
        </div>
      )}

      {/* AI Summary */}
      {aiSummary ? (
        <div className="rounded-2xl bg-white border border-gray-100 p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2">
            🤖 AI Analysis
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">{aiSummary}</p>
        </div>
      ) : (
        <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2 text-left">
            🤖 AI Analysis
          </p>
          <div className="py-4">
            <span className="text-2xl mb-2 block">🔒</span>
            <p className="text-sm text-gray-500 font-medium mb-3">AI Insights & Custom Fixes are locked.</p>
            <a href="/pricing" className="inline-block bg-brand text-white font-heading font-bold text-xs px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors">
              Upgrade to Pro
            </a>
          </div>
        </div>
      )}

      {/* Top Recommendations */}
      {aiRecommendations && aiRecommendations.length > 0 && (
        <div className="rounded-2xl bg-white border border-gray-100 p-5">
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-3">
            📋 Top Actions
          </p>
          <ol className="space-y-2.5">
            {aiRecommendations.map((rec, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-600">
                <span className="shrink-0 w-5 h-5 rounded-full bg-brand-light text-brand text-[10px] font-bold flex items-center justify-center font-mono">
                  {i + 1}
                </span>
                {rec}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Quick stats */}
      <div className="rounded-2xl bg-white border border-gray-100 p-5">
        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-3">
          📊 Page Stats
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Words',          value: report.wordCount     || '—' },
            { label: 'Images',         value: report.imagesTotalCount ?? '—' },
            { label: 'Internal Links', value: report.internalLinks  ?? '—' },
            { label: 'External Links', value: report.externalLinks  ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{label}</p>
              <p className="font-heading font-bold text-xl text-gray-800 mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords */}
      {keywords.length > 0 && (
        useAuthStore.getState().user?.plan === 'free' ? (
          <div className="rounded-2xl bg-gray-50 border border-gray-100 p-5 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-2 text-left">
              🔑 Top Keywords
            </p>
            <div className="py-4">
              <span className="text-2xl mb-2 block">🔒</span>
              <p className="text-sm text-gray-500 font-medium mb-3">Keyword Analysis is a Pro feature.</p>
              <a href="/pricing" className="inline-block bg-brand text-white font-heading font-bold text-xs px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors">
                Unlock Keywords
              </a>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-gray-100 p-5">
            <p className="font-mono text-[10px] uppercase tracking-widest text-gray-400 mb-3">
              🔑 Top Keywords
            </p>
            <div className="flex flex-wrap gap-2">
              {keywords.map((kw, i) => (
                <span
                  key={i}
                  className="font-mono text-xs bg-gray-50 border border-gray-100 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5"
                >
                  {kw.word}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded
                    ${kw.relevance === 'High'   ? 'bg-green-100 text-green-700' : ''}
                    ${kw.relevance === 'Medium' ? 'bg-amber-100 text-amber-700' : ''}
                    ${kw.relevance === 'Low'    ? 'bg-gray-100 text-gray-500'   : ''}
                  `}>
                    {kw.relevance}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
