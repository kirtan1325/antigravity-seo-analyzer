// client/src/hooks/useHistory.js
import { useState, useEffect, useCallback } from 'react';
import { getReports, deleteReport } from '../utils/api.js';
import { useAuthStore } from '../utils/store.js';

export function useHistory() {
  const { token } = useAuthStore();
  const [reports,    setReports]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });

  const fetchReports = useCallback(async (page = 1) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getReports(page);
      setReports(data.reports);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const remove = useCallback(async (id) => {
    try {
      await deleteReport(id);
      setReports(prev => prev.filter(r => r._id !== id));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => { fetchReports(1); }, [fetchReports]);

  return { reports, loading, error, pagination, fetchReports, remove };
}
