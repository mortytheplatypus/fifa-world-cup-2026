function slugifyName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function playerId(teamId, name) {
  return `${teamId.toLowerCase()}-${slugifyName(name)}`;
}

function calcAge(dateOfBirth, refDate = new Date('2026-06-11')) {
  if (!dateOfBirth) return null;
  const dob = new Date(dateOfBirth);
  let age = refDate.getFullYear() - dob.getFullYear();
  const monthDiff = refDate.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && refDate.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

const POSITION_ORDER = { GK: 0, DEF: 1, MID: 2, FWD: 3 };

function sortByPosition(players) {
  return [...players].sort((a, b) => {
    const posDiff = (POSITION_ORDER[a.position] ?? 9) - (POSITION_ORDER[b.position] ?? 9);
    if (posDiff !== 0) return posDiff;
    return (a.shirtNumber ?? 99) - (b.shirtNumber ?? 99);
  });
}

function createCurrentPlayer(team, playerData) {
  const id = playerId(team.id, playerData.name);
  const age = playerData.age ?? calcAge(playerData.dateOfBirth);
  return {
    id,
    name: playerData.name,
    teamId: team.id,
    flagCode: team.flagCode,
    position: playerData.position,
    shirtNumber: playerData.shirtNumber,
    club: playerData.club ?? null,
    dateOfBirth: playerData.dateOfBirth ?? null,
    age,
    heightCm: playerData.heightCm ?? null,
    foot: playerData.foot ?? null,
    caps: playerData.caps ?? 0,
    internationalGoals: playerData.internationalGoals ?? 0,
    wcAppearances: playerData.wcAppearances ?? 0,
    wcGoals: playerData.wcGoals ?? 0,
    worldCups: playerData.worldCups ?? [{ year: 2026, role: 'squad', goals: 0, assists: 0, minutesPlayed: null }],
  };
}

function createHistoricalPlayer(team, name, position, year, extras = {}) {
  const id = playerId(team.id, name);
  return {
    id,
    name,
    teamId: team.id,
    flagCode: team.flagCode,
    position: position ?? 'MID',
    shirtNumber: extras.shirtNumber ?? null,
    club: extras.club ?? null,
    dateOfBirth: extras.dateOfBirth ?? null,
    age: extras.age ?? null,
    heightCm: extras.heightCm ?? null,
    foot: extras.foot ?? null,
    caps: extras.caps ?? null,
    internationalGoals: extras.internationalGoals ?? null,
    wcAppearances: extras.wcAppearances ?? 1,
    wcGoals: extras.wcGoals ?? 0,
    worldCups: [{ year, role: extras.role ?? 'squad', goals: extras.goals ?? 0, assists: extras.assists ?? 0, minutesPlayed: extras.minutesPlayed ?? null }],
  };
}

function mergePlayer(existing, incoming) {
  const worldCups = [...(existing.worldCups ?? [])];
  for (const wc of incoming.worldCups ?? []) {
    if (!worldCups.some((entry) => entry.year === wc.year)) {
      worldCups.push(wc);
    }
  }
  worldCups.sort((a, b) => b.year - a.year);

  const wcAppearances = worldCups.length;
  const wcGoals = worldCups.reduce((sum, wc) => sum + (wc.goals ?? 0), 0);

  return {
    ...existing,
    ...Object.fromEntries(
      Object.entries(incoming).filter(([key, value]) => value != null && key !== 'worldCups')
    ),
    worldCups,
    wcAppearances,
    wcGoals,
  };
}

module.exports = {
  slugifyName,
  playerId,
  calcAge,
  sortByPosition,
  createCurrentPlayer,
  createHistoricalPlayer,
  mergePlayer,
  POSITION_ORDER,
};
