export const GROUP_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

export async function fetchTeams() {
  const response = await fetch('/data/groups.json');
  if (!response.ok) throw new Error('Failed to load teams');
  return response.json();
}

export async function fetchFixtures() {
  const response = await fetch('/data/fixtures.json');
  if (!response.ok) throw new Error('Failed to load fixtures');
  return response.json();
}

export async function fetchResults() {
  const response = await fetch('/data/results.json');
  if (!response.ok) throw new Error('Failed to load match results');
  return response.json();
}

export async function fetchTeamColors() {
  const response = await fetch('/data/team-colors.json');
  if (!response.ok) throw new Error('Failed to load team colors');
  return response.json();
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
