// client/src/pages/Landing.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect }   from 'react';
import URLInput          from '../components/URLInput.jsx';
import LoadingAnimation  from '../components/LoadingAnimation.jsx';
import { useAnalysis }   from '../hooks/useAnalysis.js';
import { useAnalysisStore } from '../utils/store.js';

const FEATURES = [
  { icon: '🎯', title: 'Instant SEO Score',    desc: 'Get a 0–100 score with breakdown in seconds' },
  { icon: '⚡', title: 'Page Speed Analysis',  desc: 'Real Core Web Vitals from Google PageSpeed' },
  { icon: '🤖', title: 'AI Fix Suggestions',   desc: 'Plain-English fixes, not confusing tech jargon' },
  { icon: '📈', title: 'Keyword Insights',     desc: 'See what keywords your page is targeting' },
  { icon: '🔧', title: 'Meta Tag Checker',     desc: 'Title, description, H1, canonical — all checked' },
  { icon: '📱', title: 'Mobile Friendliness',  desc: 'Verify your site works on phones and tablets' },
];

const TESTIMONIALS = [
  { name: 'Priya S.',     role: 'Blogger',           quote: 'Fixed 5 issues in one afternoon — my traffic doubled in a month!' },
  { name: 'Rajan M.',     role: 'Freelance Dev',     quote: 'I send this to every client before handing over a project. Saves me hours.' },
  { name: 'Ananya K.',    role: 'Small Business',    quote: 'Finally an SEO tool I can actually understand. No jargon, just clear fixes.' },
];

export default function Landing() {
  const { analyze, steps }   = useAnalysis();
  const { loading, step, error, report } = useAnalysisStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (report && !loading && window.location.pathname !== '/pricing') {
      navigate('/dashboard');
    }
  }, [report, loading, navigate]);

  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/pricing') {
      setTimeout(() => {
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="flex flex-col items-center text-center px-4 pt-16 pb-20">

        {/* Tag */}
        <div className="font-mono text-[11px] uppercase tracking-widest text-brand bg-brand-light px-4 py-1.5 rounded-full mb-6">
          Free SEO Analysis · Create an account to use
        </div>

        {/* Headline */}
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl max-w-3xl leading-tight mb-4">
          Find out why your site
          <br />
          <span className="text-gradient">isn't getting traffic</span>
        </h1>

        <p className="text-gray-500 text-lg max-w-xl leading-relaxed mb-10">
          Get your SEO score, exact problems, and plain-English fixes
          in under 10 seconds — completely free.
        </p>

        {/* Input or Loader */}
        {loading ? (
          <LoadingAnimation currentStep={step} url={useAnalysisStore.getState().lastUrl || ''} />
        ) : (
          <URLInput onAnalyze={analyze} loading={loading} />
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-3 text-sm max-w-lg">
            ⚠ {error}
          </div>
        )}

        {/* Social proof numbers */}
        <div className="flex flex-wrap justify-center gap-8 mt-14 text-center">
          {[
            { n: '10,000+', label: 'Sites Analyzed' },
            { n: '4.9★',    label: 'User Rating' },
            { n: '< 10s',   label: 'Analysis Time' },
          ].map(({ n, label }) => (
            <div key={label}>
              <p className="font-heading font-extrabold text-2xl text-gray-900">{n}</p>
              <p className="text-sm text-gray-400 font-mono">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid ─────────────────────────────────────────────── */}
      <section className="bg-white border-y border-gray-100 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading font-bold text-2xl text-center mb-10">
            Everything you need to rank higher
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-5 hover:border-brand-mid transition-colors"
              >
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="font-heading font-bold text-base mb-1">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading font-bold text-2xl mb-10">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { step: '1', title: 'Enter your URL',     desc: 'Paste any website URL — yours or a competitor\'s' },
              { step: '2', title: 'We analyze it',      desc: 'Our engine checks 15+ SEO factors in seconds' },
              { step: '3', title: 'Get your fix list',  desc: 'See exactly what to fix and how to fix it' },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-brand text-white font-heading font-bold text-lg flex items-center justify-center mb-3">
                  {step}
                </div>
                <h3 className="font-heading font-bold text-base mb-1">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="font-heading font-bold text-2xl text-center mb-10">
            Real users, real results
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ name, role, quote }) => (
              <div key={name} className="rounded-2xl border border-gray-100 p-5">
                <p className="text-sm text-gray-600 leading-relaxed mb-4">"{quote}"</p>
                <div>
                  <p className="font-heading font-bold text-sm">{name}</p>
                  <p className="text-xs text-gray-400 font-mono">{role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-heading font-bold text-2xl mb-2">Simple pricing</h2>
          <p className="text-gray-400 text-sm mb-10">Start free. Upgrade when you're ready.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                name: 'Free',
                price: '₹0',
                period: 'forever',
                features: ['3 scans / day', 'Core SEO score', 'Basic fix tips', 'Meta tag check'],
                cta: 'Start Free',
                highlight: false,
              },
              {
                name: 'Pro',
                price: '₹499',
                period: '/month',
                features: ['Unlimited scans', 'Full score history', 'AI meta rewrites', 'PDF reports', 'Keyword analysis'],
                cta: 'Go Pro',
                highlight: true,
              },
              {
                name: 'Agency',
                price: '₹1,999',
                period: '/month',
                features: ['Everything in Pro', 'White-label reports', '10 client accounts', 'Priority support'],
                cta: 'Agency Plan',
                highlight: false,
              },
            ].map(({ name, price, period, features, cta, highlight }) => {
                const isFree = name === 'Free';
                const isAgency = name === 'Agency';
                
                const handleBuyPlan = async () => {
                   if (isFree) {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      return;
                   }
                   
                   const token = localStorage.getItem('ag_token');
                   if (!token) {
                      navigate('/history');
                      return;
                   }
                   
                   try {
                      const { createRazorpayOrder, verifyRazorpayPayment } = await import('../utils/api.js');
                      const { useAuthStore } = await import('../utils/store.js');
                      
                      const data = await createRazorpayOrder(name.toLowerCase());
                      
                      const options = {
                         key: data.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
                         amount: data.order.amount,
                         currency: data.order.currency,
                         name: "Antigravity SEO",
                         description: `Upgrade to ${name} Plan`,
                         order_id: data.order.id,
                         handler: async function (response) {
                            try {
                               await verifyRazorpayPayment({
                                  razorpay_payment_id: response.razorpay_payment_id,
                                  razorpay_order_id: response.razorpay_order_id,
                                  razorpay_signature: response.razorpay_signature,
                                  planId: name.toLowerCase()
                               });
                               
                               useAuthStore.getState().updateUser({ plan: name.toLowerCase() });
                               navigate('/success');
                            } catch (err) {
                               alert('Payment verification failed. Please contact support.');
                            }
                         },
                         prefill: {
                            email: useAuthStore.getState().user?.email,
                            name: useAuthStore.getState().user?.name,
                         },
                         theme: { color: "#8b5cf6" } // brand color
                      };
                      
                      const rzp = new window.Razorpay(options);
                      rzp.on('payment.failed', function (response) {
                          alert(response.error.description);
                      });
                      rzp.open();
                   } catch (err) {
                      console.error('Checkout error:', err);
                      alert(err.message || 'Failed to start checkout. Check server logs.');
                   }
                };

                return (
                  <div
                    key={name}
                    className={`rounded-2xl p-6 text-left border transition-all ${
                      highlight
                        ? 'bg-brand text-white border-brand shadow-lg shadow-brand/20 scale-[1.02]'
                        : 'bg-white border-gray-100'
                    }`}
                  >
                    {highlight && (
                      <span className="font-mono text-[10px] uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full mb-3 inline-block">
                        Most Popular
                      </span>
                    )}
                    <h3 className="font-heading font-bold text-lg">{name}</h3>
                    <div className="flex items-baseline gap-1 mt-2 mb-4">
                      <span className="font-heading font-extrabold text-3xl">{price}</span>
                      <span className={`text-sm ${highlight ? 'text-white/70' : 'text-gray-400'}`}>{period}</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {features.map(f => (
                        <li key={f} className={`text-sm flex items-center gap-2 ${highlight ? 'text-white/90' : 'text-gray-600'}`}>
                          <span>✓</span> {f}
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={handleBuyPlan}
                      className={`w-full py-2.5 rounded-xl font-heading font-bold text-sm transition-all ${
                        highlight
                          ? 'bg-white text-brand hover:bg-gray-100'
                          : 'bg-brand text-white hover:bg-brand-dark'
                    }`}>
                      {cta}
                    </button>
                  </div>
                );
              })
            }
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────── */}
      <section className="bg-brand py-14 px-4 text-center text-white">
        <h2 className="font-heading font-extrabold text-3xl mb-3">
          Ready to get more traffic?
        </h2>
        <p className="text-white/70 mb-6 text-sm">
          Join free. Log your history. Upgrade when you need more power.
        </p>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-white text-brand font-heading font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors"
        >
          Analyze My Site →
        </button>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-8 px-4 text-center">
        <p className="font-mono text-xs text-gray-400">
          © {new Date().getFullYear()} Antigravity SEO · Built for indie founders & bloggers 🚀
        </p>
      </footer>
    </div>
  );
}
