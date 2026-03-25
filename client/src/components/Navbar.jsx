// client/src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../utils/store.js';
const MAX_FREE_SCANS = 5;

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand rounded-lg flex items-center justify-center text-white text-sm font-bold">
            ↑
          </div>
          <span className="font-heading font-extrabold text-sm tracking-tight">
            Antigravity
          </span>
          <span className="font-mono text-[10px] bg-brand-light text-brand px-2 py-0.5 rounded-full uppercase tracking-widest">
            SEO
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-4">
                {user.plan === 'free' ? (
                  <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
                    <span className="text-gray-500">Scans: {user.scansToday || 0}/{MAX_FREE_SCANS}</span>
                    <Link to="/pricing" className="text-brand hover:underline font-bold">Upgrade</Link>
                  </div>
                ) : (
                  <div className="hidden sm:inline-block px-2 text-[10px] font-mono uppercase bg-brand text-white rounded tracking-widest">
                    {user.plan}
                  </div>
                )}
                <Link
                  to="/history"
                  className="text-sm text-gray-600 hover:text-brand transition-colors hidden sm:block"
                >
                  History
                </Link>
                <div className="w-7 h-7 rounded-full bg-brand-light flex items-center justify-center text-brand text-xs font-bold">
                  {user.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/history"
                className="text-sm text-gray-500 hover:text-brand transition-colors hidden sm:block"
              >
                Sign In
              </Link>
              <Link
                to="/history"
                className="text-sm bg-brand text-white px-4 py-1.5 rounded-lg font-medium hover:bg-brand-dark transition-colors"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
