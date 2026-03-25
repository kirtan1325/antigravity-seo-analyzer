// client/src/components/IssueCard.jsx
import { useState } from 'react';

const SEVERITY_CONFIG = {
  critical: {
    dot:   'bg-red-500',
    badge: 'bg-red-50 text-red-600',
    fix:   'bg-red-50 border-red-100',
    fixText: 'text-red-700',
    label: 'Critical',
  },
  warning: {
    dot:   'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700',
    fix:   'bg-amber-50 border-amber-100',
    fixText: 'text-amber-800',
    label: 'Warning',
  },
  good: {
    dot:   'bg-green-500',
    badge: 'bg-green-50 text-green-700',
    fix:   'bg-green-50 border-green-100',
    fixText: 'text-green-800',
    label: 'Good',
  },
};

const CATEGORY_ICONS = {
  meta:      '🏷️',
  content:   '📝',
  speed:     '⚡',
  technical: '⚙️',
};

export default function IssueCard({ issue, index }) {
  const [open, setOpen] = useState(issue.severity === 'critical' && index < 2);
  const cfg = SEVERITY_CONFIG[issue.severity] || SEVERITY_CONFIG.warning;

  return (
    <div className={`
      rounded-2xl border bg-white overflow-hidden transition-all duration-200
      ${issue.severity === 'critical' ? 'border-red-100' : 'border-gray-100'}
      hover:border-gray-200
    `}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        {/* Dot */}
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />

        {/* Category icon */}
        <span className="text-base shrink-0">
          {CATEGORY_ICONS[issue.category] || '📌'}
        </span>

        {/* Title */}
        <span className="flex-1 text-sm font-medium text-gray-800 text-left">
          {issue.title}
        </span>

        {/* Severity badge */}
        <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full shrink-0 ${cfg.badge}`}>
          {cfg.label}
        </span>

        {/* Points badge */}
        {issue.points > 0 && (
          <span className="text-[10px] font-mono text-brand bg-brand-light px-2 py-0.5 rounded-full shrink-0">
            +{issue.points}pts
          </span>
        )}

        {/* Chevron */}
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expandable body */}
      {open && (
        <div className="px-4 pb-4 border-t border-gray-50 animate-fade-in">
          {/* Description */}
          <p className="text-sm text-gray-500 mt-3 leading-relaxed">
            {issue.description}
          </p>

          {/* Fix box */}
          {issue.fix && (
            <div className={`mt-3 rounded-xl border p-3.5 ${cfg.fix}`}>
              <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400 mb-1">
                ✦ Fix this now
              </p>
              <p className={`text-sm leading-relaxed ${cfg.fixText}`}>
                {issue.fix}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
