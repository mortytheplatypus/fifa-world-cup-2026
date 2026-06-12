export const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

const API_BASE = process.env.REACT_APP_API_URL ?? '';

const DEFAULT_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const cache = new Map();

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.promise;
}

async function fetchData(key) {
  const cached = getCached(key);
  if (cached) {
    return cached;
  }

  const path = `${API_BASE}/api/${key}`;

  const promise = fetch(path).then((response) => {
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return response.json();
  });

  cache.set(key, { promise, expiresAt: Date.now() + DEFAULT_CACHE_TTL_MS });
  promise.catch(() => cache.delete(key));

  return promise;
}

export async function fetchTeams() {
  return fetchData('teams');
}

export async function fetchFixtures() {
  return fetchData('fixtures');
}

export async function fetchResults() {
  return fetchData('results');
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
