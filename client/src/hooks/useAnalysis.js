// client/src/hooks/useAnalysis.js
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalysisStore, useAuthStore } from '../utils/store.js';
import { analyzeURL } from '../utils/api.js';

const STEPS = [
  'Fetching page content',
  'Checking meta tags & structure',
  'Analyzing keywords & content',
  'Running performance checks',
  'Generating AI recommendations',
];

export function useAnalysis() {
  const { setReport, setLoading, setError, setStep, reset } = useAnalysisStore();
  const navigate = useNavigate();

  const analyze = useCallback(async (rawUrl) => {
    // ── Required Auth check ──────────────────────────────────────
    const { user } = useAuthStore.getState();
    if (!user) {
      navigate('/history', { state: { returnTo: '/' } });
      return;
    }

    reset();
    setLoading(true);

    // Simulate progressive step reveals while API call runs
    let stepIdx = 0;
    const stepInterval = setInterval(() => {
      if (stepIdx < STEPS.length - 1) {
        stepIdx++;
        setStep(stepIdx);
      }
    }, 1200);

    try {
      let url = rawUrl.trim();
      if (!url.startsWith('http')) url = 'https://' + url;

      const data = await analyzeURL(url);

      clearInterval(stepInterval);
      setStep(STEPS.length - 1);

      // Short pause so user sees last step complete
      await new Promise(r => setTimeout(r, 400));

      setReport(data.report);
      if (data.scansToday !== undefined) {
         useAuthStore.getState().updateUser({ scansToday: data.scansToday });
      }
      navigate('/dashboard');
    } catch (err) {
      clearInterval(stepInterval);
      setError(err.message);
    }
  }, [setReport, setLoading, setError, setStep, reset, navigate]);

  return { analyze, steps: STEPS };
}
