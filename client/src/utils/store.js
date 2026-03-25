// client/src/utils/store.js
import { create } from 'zustand';

// ─── Analysis Store ────────────────────────────────────────────────────────
export const useAnalysisStore = create((set) => ({
  report:   null,
  loading:  false,
  error:    null,
  step:     0,       // current loading step (0-4)

  setReport:  (report)  => set({ report, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError:   (error)   => set({ error, loading: false }),
  setStep:    (step)    => set({ step }),
  reset:      ()        => set({ report: null, loading: false, error: null, step: 0 }),
}));

// ─── Auth Store ────────────────────────────────────────────────────────────
export const useAuthStore = create((set) => ({
  user:  JSON.parse(localStorage.getItem('ag_user') || 'null'),
  token: localStorage.getItem('ag_token') || null,

  login: (user, token) => {
    localStorage.setItem('ag_user',  JSON.stringify(user));
    localStorage.setItem('ag_token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('ag_user');
    localStorage.removeItem('ag_token');
    set({ user: null, token: null });
  },

  updateUser: (updates) =>
    set((state) => {
      const updated = { ...state.user, ...updates };
      localStorage.setItem('ag_user', JSON.stringify(updated));
      return { user: updated };
    }),
}));
