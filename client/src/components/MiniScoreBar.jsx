// client/src/components/MiniScoreBar.jsx

function StatChip({ label, value, ok }) {
  return (
    <div className={`
      flex items-center gap-2 px-3 py-2 rounded-xl text-sm border
      ${ok
        ? 'bg-green-50 border-green-100 text-green-700'
        : 'bg-red-50 border-red-100 text-red-600'
      }
    `}>
      <span>{ok ? '✓' : '✗'}</span>
      <span className="font-medium">{value}</span>
      <span className="text-xs opacity-70">{label}</span>
    </div>
  );
}

export default function MiniScoreBar({ report }) {
  if (!report) return null;

  const speedScore = report.speedData?.performanceScore;
  const speedOk    = speedScore != null ? speedScore >= 70 : report.mobileFriendly;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {speedScore != null && (
        <StatChip
          label="Speed"
          value={`${speedScore}/100`}
          ok={speedScore >= 70}
        />
      )}
      <StatChip
        label="Mobile"
        value={report.mobileFriendly ? 'Mobile OK' : 'Issues'}
        ok={report.mobileFriendly}
      />
      <StatChip
        label="SSL"
        value={report.hasSSL ? 'Secure' : 'No SSL'}
        ok={report.hasSSL}
      />
      <StatChip
        label="Canonical"
        value={report.hasCanonical ? 'Set' : 'Missing'}
        ok={report.hasCanonical}
      />
      <StatChip
        label="H1"
        value={report.h1 ? 'Found' : 'Missing'}
        ok={!!report.h1}
      />
    </div>
  );
}
