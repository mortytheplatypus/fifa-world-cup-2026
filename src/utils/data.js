export const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

const API_BASE = process.env.REACT_APP_API_URL ?? '';

async function fetchJson(path) {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) throw new Error(`Failed to load ${path}`);
  return response.json();
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
