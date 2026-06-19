import { useEffect, useState } from 'react';
import { VISITOR_COUNT_UPDATED } from '../hooks/useVisitTracker';

const API_BASE = process.env.REACT_APP_API_URL ?? '';

function VisitorCounter() {
  const [total, setTotal] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchTotal = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/visitors`);
        if (!response.ok) return;

        const data = await response.json();
        if (!cancelled) {
          setTotal(data.total);
        }
      } catch {
        // Leave hidden until count is available.
      }
    };

    const handleCountUpdated = (event) => {
      setTotal(event.detail.total);
    };

    fetchTotal();
    window.addEventListener(VISITOR_COUNT_UPDATED, handleCountUpdated);

    return () => {
      cancelled = true;
      window.removeEventListener(VISITOR_COUNT_UPDATED, handleCountUpdated);
    };
  }, []);

  if (total === null) {
    return null;
  }

  return (
    <div className="visitor-counter" aria-label={`${total} visitors`}>
      <span className="visitor-count">{total.toLocaleString()}</span>
      <span className="visitor-label">visitors</span>
    </div>
  );
}

export default VisitorCounter;
