import {
  appendCacheBust,
  DATA_CACHE_TTL_MS,
  getCachedData,
  setCachedData,
} from './dataCache';

export const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

const API_BASE = process.env.REACT_APP_API_URL ?? '';

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

  const cached = getCachedData(key);
  if (cached) {
    return cached;
  }

  const path = appendCacheBust(`${API_BASE}/api/${key}`);
  const promise = fetch(path).then((response) => {
    if (!response.ok) throw new Error(`Failed to load ${path}`);
    return response.json();
  });

  setCachedData(key, promise, DATA_CACHE_TTL_MS);

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

export function getTeamIdFromPlayerId(playerId) {
  if (!playerId) {
    return null;
  }

  return playerId.split('-')[0].toUpperCase();
}

async function loadPlayersData() {
  return fetchData('players');
}

function getTeamPlayersFromData(data, teamId) {
  const root = data.players ?? {};
  const normalizedTeamId = teamId.toUpperCase();
  const teamPlayers = root[normalizedTeamId];

  if (teamPlayers && typeof teamPlayers === 'object' && !teamPlayers.id) {
    return teamPlayers;
  }

  return Object.fromEntries(
    Object.entries(root).filter(([, player]) => player?.teamId === normalizedTeamId)
  );
}

export async function fetchTeamPlayers(teamId) {
  if (!teamId) {
    return {};
  }

  const data = await loadPlayersData();
  return getTeamPlayersFromData(data, teamId);
}

export async function fetchPlayer(playerId) {
  if (!playerId) {
    return null;
  }

  const teamId = getTeamIdFromPlayerId(playerId);
  const players = await fetchTeamPlayers(teamId);
  return players[playerId] ?? null;
}

export async function fetchPlayersByIds(playerIds, teamId) {
  const ids = [...new Set((playerIds ?? []).filter(Boolean))];

  if (!ids.length) {
    return {};
  }

  if (teamId) {
    const players = await fetchTeamPlayers(teamId);
    return Object.fromEntries(
      ids.map((id) => [id, players[id]]).filter(([, player]) => player)
    );
  }

  const byTeam = ids.reduce((acc, id) => {
    const idTeam = getTeamIdFromPlayerId(id);
    if (!acc[idTeam]) {
      acc[idTeam] = [];
    }
    acc[idTeam].push(id);
    return acc;
  }, {});

  const teamMaps = await Promise.all(
    Object.entries(byTeam).map(async ([idTeam, teamIds]) => {
      const players = await fetchTeamPlayers(idTeam);
      return Object.fromEntries(
        teamIds.map((id) => [id, players[id]]).filter(([, player]) => player)
      );
    })
  );

  return Object.assign({}, ...teamMaps);
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

export {
  DATA_CACHE_TTL_MS,
  evictAllDataCache,
  isForceRefreshCacheEnabled,
  setForceRefreshCache,
} from './dataCache';
