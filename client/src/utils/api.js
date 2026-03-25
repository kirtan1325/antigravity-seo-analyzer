// client/src/utils/api.js
import axios from 'axios';

let envBaseUrl = import.meta.env.VITE_API_BASE_URL || '/api';
if (envBaseUrl !== '/api' && !envBaseUrl.endsWith('/api')) {
  envBaseUrl = `${envBaseUrl.replace(/\/$/, '')}/api`;
}
const BASE_URL = envBaseUrl;

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 35000,   // PageSpeed can take 30s
  headers: { 'Content-Type': 'application/json' },
});

// ─── Attach JWT automatically ──────────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ag_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Global error normaliser ───────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const errorMsg = err.response?.data?.error || err.message;

    // Force logout ONLY if token is corrupted/expired, NOT when Razorpay fails with a 401
    if (
        err.response?.status === 401 && 
        (errorMsg.includes('log in') || errorMsg.includes('expired') || errorMsg.includes('token') || errorMsg.includes('Authentication required'))
    ) {
      localStorage.removeItem('ag_user');
      localStorage.removeItem('ag_token');
      window.location.href = '/login';
    }
  
    const message = errorMsg || 'Something went wrong.';
    return Promise.reject(new Error(message));
  }
);

// ─── Typed API functions ───────────────────────────────────────────────────
export const analyzeURL    = (url)  => api.post('/analyze', { url });
export const getReports    = (page) => api.get('/reports', { params: { page } });
export const getReport     = (id)   => api.get(`/reports/${id}`);
export const deleteReport  = (id)   => api.delete(`/reports/${id}`);
export const getDomainHistory = (domain) => api.get(`/reports/domain/${domain}`);

export const register = (name, email, password) =>
  api.post('/auth/register', { name, email, password });
export const login = (email, password) =>
  api.post('/auth/login', { email, password });
export const getMe = () => api.get('/auth/me');

export const createRazorpayOrder = (planId) => 
  api.post('/billing/create-order', { planId });
export const verifyRazorpayPayment = (paymentData) =>
  api.post('/billing/verify-payment', paymentData);

export default api;
