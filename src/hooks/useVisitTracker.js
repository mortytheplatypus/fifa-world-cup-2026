import { useEffect } from 'react';

const VISIT_RECORDED_KEY = 'visit_recorded';
export const VISITOR_COUNT_UPDATED = 'visitor-count-updated';

const API_BASE = process.env.REACT_APP_API_URL ?? '';

function dispatchVisitorCountUpdated(total) {
  window.dispatchEvent(
    new CustomEvent(VISITOR_COUNT_UPDATED, { detail: { total } })
  );
}

export function useVisitTracker() {
  useEffect(() => {
    if (sessionStorage.getItem(VISIT_RECORDED_KEY)) {
      return;
    }

    const recordVisit = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/visitors`, {
          method: 'POST',
        });
        if (!response.ok) return;

        const { total } = await response.json();
        sessionStorage.setItem(VISIT_RECORDED_KEY, '1');
        dispatchVisitorCountUpdated(total);
      } catch {
        // Counter still works via GET if recording fails.
      }
    };

    recordVisit();
  }, []);
}
