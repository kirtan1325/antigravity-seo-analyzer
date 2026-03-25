// client/src/components/LoadingAnimation.jsx

const STEPS = [
  { icon: '🌐', label: 'Fetching page content' },
  { icon: '🏷️', label: 'Checking meta tags & structure' },
  { icon: '🔍', label: 'Analyzing keywords & content' },
  { icon: '⚡', label: 'Running performance checks' },
  { icon: '🤖', label: 'Generating AI recommendations' },
];

export default function LoadingAnimation({ currentStep = 0, url }) {
  const progress = Math.round(((currentStep + 1) / STEPS.length) * 100);

  return (
    <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-fade-in">

      {/* URL being analyzed */}
      <p className="font-mono text-xs text-gray-400 mb-4 truncate">
        Scanning: <span className="text-brand">{url}</span>
      </p>

      {/* Steps */}
      <div className="space-y-3 mb-5">
        {STEPS.map((step, i) => {
          const isDone   = i < currentStep;
          const isActive = i === currentStep;
          return (
            <div key={i} className="flex items-center gap-3">
              {/* Status dot */}
              <div className={`
                w-5 h-5 rounded-full flex items-center justify-center text-[11px] shrink-0 transition-all duration-300
                ${isDone   ? 'bg-green-500 text-white' : ''}
                ${isActive ? 'border-2 border-brand animate-pulse-dot' : ''}
                ${!isDone && !isActive ? 'border-2 border-gray-200' : ''}
              `}>
                {isDone ? '✓' : ''}
              </div>

              <span className={`text-sm transition-colors duration-200
                ${isDone   ? 'text-green-600 line-through decoration-green-300' : ''}
                ${isActive ? 'text-gray-900 font-medium' : ''}
                ${!isDone && !isActive ? 'text-gray-400' : ''}
              `}>
                {step.icon} {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-right text-xs text-gray-400 mt-1 font-mono">{progress}%</p>
    </div>
  );
}
