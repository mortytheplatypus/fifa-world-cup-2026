import { KNOCKOUT_MATCH_IDS } from './knockout';
import {
  appendCacheBust,
  DATA_CACHE_TTL_MS,
  getCachedData,
  setCachedData,
} from './dataCache';

const API_BASE = process.env.REACT_APP_API_URL ?? '';
const KNOCKOUT_RESULTS_CACHE_KEY = 'knockoutResults';

async function fetchKnockoutResult(matchId) {
  const path = appendCacheBust(`${API_BASE}/api/knockouts/${matchId}`);
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
  const path = appendCacheBust(`${API_BASE}/api/knockouts`);
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
  const cached = getCachedData(KNOCKOUT_RESULTS_CACHE_KEY);
  if (cached) {
    return cached;
  }

  const promise = loadKnockoutResults();
  setCachedData(KNOCKOUT_RESULTS_CACHE_KEY, promise, DATA_CACHE_TTL_MS);

  return promise;
}
