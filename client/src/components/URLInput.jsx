// client/src/components/URLInput.jsx
import { useState } from 'react';

export default function URLInput({ onAnalyze, loading }) {
  const [url, setUrl] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!url.trim() || loading) return;
    onAnalyze(url.trim());
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl">
      <div className="flex items-center bg-white border-2 border-gray-100 focus-within:border-brand rounded-2xl p-2 shadow-sm transition-colors duration-200">
        {/* Globe icon */}
        <div className="pl-2 pr-1 text-gray-400 shrink-0">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="2" y1="12" x2="22" y2="12"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </div>

        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://yourwebsite.com"
          className="flex-1 font-mono text-sm bg-transparent outline-none px-2 py-2 text-gray-800 placeholder-gray-400"
          disabled={loading}
          autoFocus
        />

        <button
          type="submit"
          disabled={loading || !url.trim()}
          className="shrink-0 bg-brand hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-heading font-bold text-sm px-5 py-2.5 rounded-xl transition-all duration-150 active:scale-95"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Analyzing...
            </span>
          ) : (
            'Analyze →'
          )}
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 mt-3 font-mono">
        Try: <code className="bg-brand-light text-brand px-1.5 py-0.5 rounded text-[11px]">yourdomain.com</code>
        {' '}— no login required
      </p>
    </form>
  );
}
