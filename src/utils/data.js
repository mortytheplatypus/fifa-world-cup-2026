export const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

const STATIC_CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // teams & fixtures
const DEFAULT_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const CACHE_TTL_BY_KEY = {
  teams: STATIC_CACHE_TTL_MS,
  fixtures: STATIC_CACHE_TTL_MS,
  squads: STATIC_CACHE_TTL_MS,
  players: STATIC_CACHE_TTL_MS,
  wcHistory: STATIC_CACHE_TTL_MS,
};

const cache = new Map();

function getCacheTtl(key) {
  return CACHE_TTL_BY_KEY[key] ?? DEFAULT_CACHE_TTL_MS;
}

function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.promise;
}

const COLLECTION_KEYS = {
  results: 'matches',
  squads: 'squads',
  players: 'players',
  wcHistory: 'wcHistory',
};

async function fetchData(key, { id, notFoundValue = null } = {}) {
  if (id) {
    const data = await fetchData(key);
    const collectionKey = COLLECTION_KEYS[key];
    const record = collectionKey ? data[collectionKey]?.[id] : data[id];

    if (!record) {
      return notFoundValue;
    }

    if (key === 'squads' || key === 'wcHistory') {
      return { teamId: id, ...record };
    }

    return record;
  }

  const cached = getCached(key);
  if (cached) {
    return cached;
  }

  const path = `/data/${key}.json`;
  // const path = `${API_BASE}/api/${key}`;
  const promise = fetch(path).then((response) => {
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return response.json();
  });

  cache.set(key, { promise, expiresAt: Date.now() + getCacheTtl(key) });
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

export async function fetchSquad(teamId) {
  if (!teamId) {
    return null;
  }

  return fetchData('squads', { id: teamId.toUpperCase() });
}

export async function fetchPlayer(playerId) {
  if (!playerId) {
    return null;
  }

  return fetchData('players', { id: playerId });
}

export async function fetchPlayersByIds(playerIds) {
  const ids = [...new Set((playerIds ?? []).filter(Boolean))];

  if (!ids.length) {
    return {};
  }

  const players = await Promise.all(ids.map((id) => fetchPlayer(id)));

  return Object.fromEntries(players.filter(Boolean).map((player) => [player.id, player]));
}

export async function fetchWcHistory(teamId) {
  if (!teamId) {
    return null;
  }

  return fetchData('wcHistory', { id: teamId.toUpperCase() });
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

export function getTeamByFlagCode(teams, flagCode) {
  if (!flagCode) {
    return undefined;
  }

  const normalized = flagCode.toLowerCase();
  return teams.find((team) => team.flagCode.toLowerCase() === normalized);
}

export function getTeamPath(team) {
  return `/teams/${team.flagCode}`;
}

export function getPlayerPath(player) {
  return `/players/${player.id}`;
}

export function resolvePlayers(playerIds, playersMap) {
  return (playerIds ?? [])
    .map((id) => playersMap[id])
    .filter(Boolean);
}

const BEST_FINISH_LABELS = {
  champion: 'World Cup winners',
  runnerUp: 'Runners-up',
  thirdPlace: 'Third place',
  semifinal: 'Semi-finals',
  quarterfinal: 'Quarter-finals',
  roundOf16: 'Round of 16',
  group: 'Group stage',
};

export function getBestFinishLabel(bestFinish) {
  return BEST_FINISH_LABELS[bestFinish] ?? bestFinish;
}

const WC_STAGE_LABELS = {
  champion: 'Champions',
  runnerUp: 'Runners-up',
  thirdPlace: 'Third place',
  semifinal: 'Semi-finals',
  quarterfinal: 'Quarter-finals',
  roundOf16: 'Round of 16',
  group: 'Group stage',
};

const WC_ROLE_LABELS = {
  squad: 'Squad member',
  starter: 'Starter',
  substitute: 'Substitute',
};

export function getWcStageLabel(stage) {
  return WC_STAGE_LABELS[stage] ?? stage;
}

export function getWcRoleLabel(role) {
  return WC_ROLE_LABELS[role] ?? getWcStageLabel(role) ?? role;
}

const TEAM_DISPLAY_NAMES = {
  'Bosnia and Herzegovina': 'Bosnia H',
  'South Korea': 'S Korea',
  'Saudi Arabia': 'Saudi',
  'United States': 'USA',
  'South Africa': 'S Africa',
};

export function getTeamDisplayName(name) {
  if (!name) {
    return name;
  }

  return TEAM_DISPLAY_NAMES[name] ?? name;
}

export function isValidGroup(groupId) {
  return GROUP_LETTERS.includes(groupId?.toUpperCase());
}
