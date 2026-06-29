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

function normalizeName(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\(captain\)/gi, '')
    .trim();
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

const POSITION_MAP = {
  '1 GK': 'GK',
  '2 DF': 'DEF',
  '3 MF': 'MID',
  '4 FW': 'FWD',
};

function mapPosition(posCode) {
  return POSITION_MAP[posCode] ?? posCode;
}

function mergeWorldCups(existing = [], year = 2026) {
  const cups = existing.filter((entry) => entry.year !== year);
  cups.push({ year, role: 'squad', goals: 0, assists: 0, minutesPlayed: null });
  return cups.sort((a, b) => b.year - a.year);
}

function createSquadPlayer({
  teamId,
  flagCode,
  name,
  position,
  shirtNumber,
  club,
  dateOfBirth,
  caps,
  internationalGoals,
  existing,
}) {
  const id = existing?.id ?? playerId(teamId, name);
  const worldCups = mergeWorldCups(existing?.worldCups);
  const wcAppearances = worldCups.filter((entry) => entry.year !== 2026).length + 1;

  return {
    id,
    name,
    teamId,
    flagCode,
    position,
    shirtNumber,
    club,
    dateOfBirth,
    age: calcAge(dateOfBirth),
    heightCm: existing?.heightCm ?? null,
    foot: existing?.foot ?? null,
    caps,
    internationalGoals,
    wcAppearances: existing?.wcAppearances != null ? Math.max(existing.wcAppearances, wcAppearances) : wcAppearances,
    wcGoals: existing?.wcGoals ?? 0,
    worldCups,
    ...(existing?.imageUrl ? { imageUrl: existing.imageUrl } : {}),
  };
}

module.exports = {
  slugifyName,
  playerId,
  normalizeName,
  calcAge,
  mapPosition,
  mergeWorldCups,
  createSquadPlayer,
};
