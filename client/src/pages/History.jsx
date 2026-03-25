// client/src/pages/History.jsx
import { useState } from 'react';
import { Link }     from 'react-router-dom';
import { useHistory }  from '../hooks/useHistory.js';
import { useAuthStore } from '../utils/store.js';
import { register, login } from '../utils/api.js';
import { extractDomain, formatDate } from "../../../server/shared/helpers.js";

// ─── Auth Form ─────────────────────────────────────────────────────────────
function AuthForm({ onSuccess }) {
  const [mode,  setMode]  = useState('login');   // 'login' | 'register'
  const [name,  setName]  = useState('');
  const [email, setEmail] = useState('');
  const [pass,  setPass]  = useState('');
  const [err,   setErr]   = useState('');
  const [busy,  setBusy]  = useState(false);

  const { login: storeLogin } = useAuthStore();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const data = mode === 'register'
        ? await register(name, email, pass)
        : await login(email, pass);
      storeLogin(data.user, data.token);
      onSuccess();
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
        <h2 className="font-heading font-bold text-xl mb-1 text-center">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h2>
        <p className="text-sm text-gray-400 text-center mb-6">
          {mode === 'login'
            ? 'Sign in to see your report history'
            : 'Save reports and track progress'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-mono text-gray-500 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-gray-500 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-500 mb-1">Password</label>
            <input
              type="password"
              value={pass}
              onChange={e => setPass(e.target.value)}
              placeholder="Min 8 characters"
              minLength={8}
              required
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-brand transition-colors"
            />
          </div>

          {err && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              ⚠ {err}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-brand text-white font-heading font-bold py-3 rounded-xl hover:bg-brand-dark transition-colors disabled:opacity-50"
          >
            {busy ? 'Please wait...' : mode === 'login' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-4">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(m => m === 'login' ? 'register' : 'login'); setErr(''); }}
            className="text-brand hover:underline font-medium"
          >
            {mode === 'login' ? 'Sign up free' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

// ─── Score badge ───────────────────────────────────────────────────────────
function ScoreBadge({ score }) {
  const color =
    score >= 85 ? 'bg-green-100 text-green-700' :
    score >= 70 ? 'bg-blue-100 text-blue-700' :
    score >= 50 ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-600';
  return (
    <span className={`font-mono font-bold text-sm px-2.5 py-1 rounded-lg ${color}`}>
      {score}
    </span>
  );
}

// ─── Report Row ────────────────────────────────────────────────────────────
function ReportRow({ report, onDelete }) {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl px-4 py-3 hover:border-gray-200 transition-colors">
      <div className="flex items-center gap-4 min-w-0">
        <ScoreBadge score={report.score} />
        <div className="min-w-0">
          <p className="font-mono text-sm text-gray-800 truncate max-w-xs">
            {extractDomain(report.url)}
          </p>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{formatDate(report.createdAt)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-xs font-mono px-2 py-0.5 rounded-full border
          ${report.grade === 'Excellent' ? 'bg-green-50 text-green-700 border-green-100' :
            report.grade === 'Good'      ? 'bg-blue-50 text-blue-700 border-blue-100' :
            report.grade === 'Needs Work'? 'bg-amber-50 text-amber-700 border-amber-100' :
                                           'bg-red-50 text-red-600 border-red-100'}
        `}>
          {report.grade}
        </span>
        <button
          onClick={() => onDelete(report._id)}
          className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
          title="Delete report"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ─── Main History Page ─────────────────────────────────────────────────────
export default function History() {
  const { user } = useAuthStore();
  const { reports, loading, error, pagination, fetchReports, remove } = useHistory();
  const [refreshed, setRefreshed] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-16">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📊</div>
          <h1 className="font-heading font-bold text-2xl mb-2">Your Analysis History</h1>
          <p className="text-gray-500 text-sm">Sign in to see your saved reports and track SEO progress over time.</p>
        </div>
        <AuthForm onSuccess={() => setRefreshed(!refreshed)} />
        <Link to="/" className="mt-6 text-sm text-brand hover:underline font-mono">
          ← Back to analyzer
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-heading font-bold text-2xl">Report History</h1>
            <p className="text-sm text-gray-400 font-mono mt-0.5">
              {pagination.total} report{pagination.total !== 1 ? 's' : ''} saved
            </p>
          </div>
          <Link
            to="/"
            className="text-sm bg-brand text-white px-4 py-2 rounded-xl font-mono hover:bg-brand-dark transition-colors"
          >
            + New Scan
          </Link>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-3 text-sm mb-4">
            ⚠ {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!loading && reports.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <div className="text-4xl mb-3">🔍</div>
            <h3 className="font-heading font-bold text-lg mb-2">No reports yet</h3>
            <p className="text-gray-400 text-sm mb-4">Run your first analysis to see it here.</p>
            <Link
              to="/"
              className="inline-block bg-brand text-white font-heading font-bold px-5 py-2.5 rounded-xl hover:bg-brand-dark transition-colors text-sm"
            >
              Analyze a Website →
            </Link>
          </div>
        )}

        {/* Report list */}
        {!loading && reports.length > 0 && (
          <div className="space-y-2.5">
            {reports.map(r => (
              <ReportRow key={r._id} report={r} onDelete={remove} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => fetchReports(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 font-mono transition-colors"
            >
              ← Prev
            </button>
            <span className="font-mono text-sm text-gray-500">
              {pagination.page} / {pagination.pages}
            </span>
            <button
              onClick={() => fetchReports(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 text-sm border border-gray-200 rounded-xl disabled:opacity-40 hover:bg-gray-50 font-mono transition-colors"
            >
              Next →
            </button>
          </div>
        )}

        {/* Plan upgrade nudge for free users */}
        {user.plan === 'free' && (
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-brand to-purple-600 p-5 text-white text-center">
            <p className="font-heading font-bold text-base mb-1">You're on the Free plan</p>
            <p className="text-white/70 text-xs mb-3">
              Upgrade to Pro for unlimited scans, AI rewrites, and full history.
            </p>
            <button 
              onClick={async (e) => {
                const btn = e.currentTarget;
                btn.disabled = true;
                btn.textContent = 'Preparing...';
                try {
                  const { createRazorpayOrder, verifyRazorpayPayment } = await import('../utils/api.js');
                  const { useAuthStore } = await import('../utils/store.js');
                  
                  const data = await createRazorpayOrder('pro');
                  
                  const options = {
                     key: data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
                     amount: data.order.amount,
                     currency: data.order.currency,
                     name: "Antigravity SEO",
                     description: `Upgrade to Pro Plan`,
                     order_id: data.order.id,
                     handler: async function (response) {
                        btn.textContent = 'Verifying...';
                        try {
                           await verifyRazorpayPayment({
                              razorpay_payment_id: response.razorpay_payment_id,
                              razorpay_order_id: response.razorpay_order_id,
                              razorpay_signature: response.razorpay_signature,
                              planId: 'pro'
                           });
                           
                           useAuthStore.getState().updateUser({ plan: 'pro' });
                           window.location.href = '/success';
                        } catch (err) {
                           alert('Payment verification failed.');
                           btn.disabled = false;
                           btn.textContent = 'Upgrade to Pro · ₹499/mo';
                        }
                     },
                     modal: {
                       ondismiss: function() {
                         btn.disabled = false;
                         btn.textContent = 'Upgrade to Pro · ₹499/mo';
                       }
                     },
                     prefill: {
                        email: useAuthStore.getState().user?.email,
                        name: useAuthStore.getState().user?.name,
                     },
                     theme: { color: "#8b5cf6" }
                  };
                  
                  const rzp = new window.Razorpay(options);
                  rzp.on('payment.failed', function (response){
                      alert(response.error.description);
                      btn.disabled = false;
                      btn.textContent = 'Upgrade to Pro · ₹499/mo';
                  });
                  rzp.open();
                } catch (err) {
                  alert(err.message || 'Failed to checkout');
                  btn.disabled = false;
                  btn.textContent = 'Upgrade to Pro · ₹499/mo';
                }
              }}
              className="bg-white text-brand font-heading font-bold text-sm px-5 py-2 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Upgrade to Pro · ₹499/mo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
