import { useEffect } from 'react';
import { writeVisitCountCache } from '../utils/visitCountCache';

const VISIT_RECORDED_KEY = 'visit_recorded';
export const VISITOR_COUNT_UPDATED = 'visitor-count-updated';

const API_BASE = process.env.REACT_APP_API_URL ?? '';

function dispatchVisitorCountUpdated(total) {
  window.dispatchEvent(
    new CustomEvent(VISITOR_COUNT_UPDATED, { detail: { total } })
  );
}

async function fetchVisitCount() {
  const response = await fetch(`${API_BASE}/api/visitors`);
  if (!response.ok) {
    throw new Error('Failed to fetch visit count');
  }

  const { total } = await response.json();
  writeVisitCountCache(total);
  dispatchVisitorCountUpdated(total);
  return total;
}

async function recordNewVisit() {
  const response = await fetch(`${API_BASE}/api/visitors`, {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to record visit');
  }

  const { total } = await response.json();
  sessionStorage.setItem(VISIT_RECORDED_KEY, '1');
  writeVisitCountCache(total);
  dispatchVisitorCountUpdated(total);
  return total;
}

export function useVisitTracker() {
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        if (sessionStorage.getItem(VISIT_RECORDED_KEY)) {
          await fetchVisitCount();
          return;
        }

        await recordNewVisit();
      } catch {
        if (cancelled) return;

        try {
          await fetchVisitCount();
        } catch {
          // Cached count remains available for settings display.
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, []);
}
