export const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

const API_BASE = process.env.REACT_APP_API_URL ?? '';

const DEFAULT_CACHE_TTL_MS = 60 * 60 * 1000;

const CACHE_TTL_MS = {
  '/api/teams': DEFAULT_CACHE_TTL_MS,
  '/api/fixtures': DEFAULT_CACHE_TTL_MS,
  '/api/results': DEFAULT_CACHE_TTL_MS,
};

const cache = new Map();

function getCached(path) {
  const entry = cache.get(path);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    cache.delete(path);
    return null;
  }
  return entry.promise;
}

async function fetchJson(path) {
  const cached = getCached(path);
  if (cached) {
    return cached;
  }

  const ttl = CACHE_TTL_MS[path] ?? 5 * 60 * 1000;
  const promise = fetch(`${API_BASE}${path}`).then((response) => {
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return response.json();
  });

  cache.set(path, { promise, expiresAt: Date.now() + ttl });
  promise.catch(() => cache.delete(path));

  return promise;
}

export async function fetchTeams() {
  return fetchJson('/api/teams');
}

export async function fetchFixtures() {
  return fetchJson('/api/fixtures');
}

export async function fetchResults() {
  return fetchJson('/api/results');
}

export async function fetchTeamColors() {
  const teams = await fetchTeams();
  return Object.fromEntries(
    teams.filter((team) => team.colors?.length).map((team) => [team.id, team.colors])
  );
}

export function groupTeamsByLetter(teams) {
  return GROUP_LETTERS.reduce((acc, letter) => {
    acc[letter] = teams.filter((team) => team.group === letter);
    return acc;
  }, {});
}

export function getTeamById(teams, id) {
  return teams.find((team) => team.id === id);
}

export function isValidGroup(groupId) {
  return GROUP_LETTERS.includes(groupId?.toUpperCase());
}
