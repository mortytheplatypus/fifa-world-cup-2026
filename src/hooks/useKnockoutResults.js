import { useEffect, useState } from 'react';
import { fetchKnockoutResults } from '../utils/knockoutResults';

export function useKnockoutResults() {
  const [knockoutResults, setKnockoutResults] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const results = await fetchKnockoutResults();
        if (!cancelled) {
          setKnockoutResults(results);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  return { knockoutResults, loading, error };
}
