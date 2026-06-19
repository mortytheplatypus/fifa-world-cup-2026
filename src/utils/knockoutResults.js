import { KNOCKOUT_MATCH_IDS } from './knockout';

const API_BASE = process.env.REACT_APP_API_URL ?? '';
const KNOCKOUT_RESULTS_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

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

async function fetchKnockoutResultsBulk() {
  const path = `${API_BASE}/api/knockouts`;
  const response = await fetch(path);

  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }

  const data = await response.json();
  return data.matches ?? {};
}

async function fetchKnockoutResultsPerMatch() {
  const entries = await Promise.all(
    KNOCKOUT_MATCH_IDS.map(async (matchId) => {
      try {
        const result = await fetchKnockoutResult(matchId);
        return result ? [matchId, result] : null;
      } catch {
        return null;
      }
    })
  );

  return Object.fromEntries(entries.filter(Boolean));
}

async function loadKnockoutResults() {
  try {
    return await fetchKnockoutResultsBulk();
  } catch {
    return fetchKnockoutResultsPerMatch();
  }
}

export async function fetchKnockoutResults() {
  if (cachedResultsPromise && Date.now() < cachedResultsExpiresAt) {
    return cachedResultsPromise;
  }

  cachedResultsPromise = loadKnockoutResults();
  cachedResultsExpiresAt = Date.now() + KNOCKOUT_RESULTS_CACHE_TTL_MS;

  cachedResultsPromise.catch(() => {
    cachedResultsPromise = null;
    cachedResultsExpiresAt = 0;
  });

  return cachedResultsPromise;
}
