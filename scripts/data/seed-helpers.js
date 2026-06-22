function cp(name, position, shirtNumber, club, dateOfBirth, heightCm, foot, caps, internationalGoals, wcAppearances = 0, wcGoals = 0) {
  return {
    name,
    position,
    shirtNumber,
    club,
    dateOfBirth,
    heightCm,
    foot,
    caps,
    internationalGoals,
    wcAppearances,
    wcGoals,
    worldCups: [{ year: 2026, role: 'squad', goals: 0, assists: 0, minutesPlayed: null }],
  };
}

function sq(...entries) {
  return entries.map((e) => {
    if (typeof e === 'object') return e;
    const [name, position = 'MID'] = e.split('|').map((s) => s.trim());
    return { name, position };
  });
}

function tour(year, host, stage, stageLabel, squad) {
  return { year, host, stage, stageLabel, squad };
}

function serialize(value, indent = 0) {
  const pad = '  '.repeat(indent);
  const padInner = '  '.repeat(indent + 1);
  if (value === null) return 'null';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const items = value.map((item) => `${padInner}${serialize(item, indent + 1)}`);
    return `[\n${items.join(',\n')}\n${pad}]`;
  }
  const entries = Object.entries(value).map(
    ([key, val]) => `${padInner}${JSON.stringify(key)}: ${serialize(val, indent + 1)}`
  );
  return `{\n${entries.join(',\n')}\n${pad}}`;
}

module.exports = { cp, sq, tour, serialize };
