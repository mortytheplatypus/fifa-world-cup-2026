const SCORER_SEGMENT =
  /(.+?)\s+(\d+(?:['']?\+\d+)?)'(?:\s*\((OG|og|p|P)\))?$/i;
const SCORER_SEGMENT_TRAILING_MARKER =
  /(.+?)\s+\((OG|og|p|P)\)$/i;

function normalizeScorersString(raw) {
  if (raw == null || raw === 'null' || raw === '') {
    return [];
  }

  const normalized = String(raw)
    .replace(/[\u201C\u201D\u2018\u2019]/g, '"')
    .trim();

  if (normalized === 'null') {
    return [];
  }

  const segments = [];
  const quoted = normalized.match(/"([^"]*)"/g);

  if (quoted?.length) {
    for (const match of quoted) {
      const value = match.slice(1, -1).trim();
      if (value) {
        segments.push(value);
      }
    }
    return segments;
  }

  const inner = normalized.replace(/^\{|\}$/g, '').trim();
  if (!inner) {
    return [];
  }

  return inner
    .split(',')
    .map((part) => part.replace(/^"|"$/g, '').trim())
    .filter(Boolean);
}

function parseScorerSegment(segment, team) {
  const withMinute = segment.match(SCORER_SEGMENT);
  if (withMinute) {
    let scorer = withMinute[1].trim();
    const minuteRaw = withMinute[2].replace(/'/g, '');
    const minute = minuteRaw.includes('+')
      ? minuteRaw
      : Number(minuteRaw);
    const marker = withMinute[3]?.toUpperCase();

    if (marker === 'OG') {
      scorer = `(OG) ${scorer}`;
    } else if (marker === 'P') {
      scorer = `${scorer} (P)`;
    }

    return { minute, scorer, team };
  }

  const trailingMarker = segment.match(SCORER_SEGMENT_TRAILING_MARKER);
  if (trailingMarker) {
    let scorer = trailingMarker[1].trim();
    const marker = trailingMarker[2].toUpperCase();

    if (marker === 'OG') {
      scorer = `(OG) ${scorer}`;
    } else if (marker === 'P') {
      scorer = `${scorer} (P)`;
    }

    return { minute: 0, scorer, team };
  }

  return null;
}

function goalMinuteSortKey(minute) {
  const [base, extra = '0'] = String(minute).split('+');
  return Number(base) * 100 + Number(extra);
}

function sortGoals(goals) {
  return [...goals].sort(
    (a, b) => goalMinuteSortKey(a.minute) - goalMinuteSortKey(b.minute)
  );
}

function parseScorers(raw, team) {
  const segments = normalizeScorersString(raw);
  const goals = [];

  for (const segment of segments) {
    const goal = parseScorerSegment(segment, team);
    if (goal) {
      goals.push(goal);
    }
  }

  return goals;
}

function parseMatchGoals(homeScorers, awayScorers) {
  const goals = [
    ...parseScorers(homeScorers, 'home'),
    ...parseScorers(awayScorers, 'away'),
  ];

  return sortGoals(goals);
}

module.exports = {
  normalizeScorersString,
  parseScorers,
  parseMatchGoals,
  sortGoals,
  goalMinuteSortKey,
};
