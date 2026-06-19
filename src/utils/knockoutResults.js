import { KNOCKOUT_MATCH_IDS } from './knockout';

const API_BASE = process.env.REACT_APP_API_URL ?? '';
const KNOCKOUT_RESULTS_CACHE_TTL_MS = 60 * 60 * 1000;

let cachedResultsPromise = null;
let cachedResultsExpiresAt = 0;

async function fetchKnockoutResult(matchId) {
  const path = `${API_BASE}/api/knockouts/${matchId}`;
  const response = await fetch(path);

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  return response.json();
}

export async function fetchKnockoutResults() {
  if (cachedResultsPromise && Date.now() < cachedResultsExpiresAt) {
    return cachedResultsPromise;
  }

  cachedResultsPromise = Promise.all(
    KNOCKOUT_MATCH_IDS.map(async (matchId) => {
      try {
        const result = await fetchKnockoutResult(matchId);
        return result ? [matchId, result] : null;
      } catch {
        return null;
      }
    })
  ).then((entries) =>
    Object.fromEntries(entries.filter(Boolean))
  );

  cachedResultsExpiresAt = Date.now() + KNOCKOUT_RESULTS_CACHE_TTL_MS;
  cachedResultsPromise.catch(() => {
    cachedResultsPromise = null;
    cachedResultsExpiresAt = 0;
  });

  return cachedResultsPromise;
}
