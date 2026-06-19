const CACHE_KEY = 'visit_count_cache';

export function readVisitCountCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;

    const { total } = JSON.parse(raw);
    return typeof total === 'number' && total >= 0 ? total : null;
  } catch {
    return null;
  }
}

export function writeVisitCountCache(total) {
  if (typeof total !== 'number' || total < 0) return;

  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ total, updatedAt: Date.now() })
    );
  } catch {
    // Ignore storage quota or privacy mode errors.
  }
}
