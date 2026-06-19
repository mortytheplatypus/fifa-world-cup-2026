import { useEffect, useState } from 'react';
import { VISITOR_COUNT_UPDATED } from '../hooks/useVisitTracker';
import { readVisitCountCache } from '../utils/visitCountCache';

function VisitorCounter() {
  const [total, setTotal] = useState(() => readVisitCountCache());

  useEffect(() => {
    const handleCountUpdated = (event) => {
      setTotal(event.detail.total);
    };

    window.addEventListener(VISITOR_COUNT_UPDATED, handleCountUpdated);

    return () => {
      window.removeEventListener(VISITOR_COUNT_UPDATED, handleCountUpdated);
    };
  }, []);

  if (total === null) {
    return null;
  }

  return (
    <div className="visitor-counter" aria-label={`${total} visits`}>
      <span className="visitor-count">{total.toLocaleString()}</span>
      <span className="visitor-label">visits</span>
    </div>
  );
}

export default VisitorCounter;
