import { DISPLAY_TIMEZONE, parseFixtureInstant } from './timezone';

export function flattenFixtures(fixturesByGroup) {
  return Object.entries(fixturesByGroup).flatMap(([group, fixtures]) =>
    fixtures.map((fixture) => ({ ...fixture, group }))
  );
}

export function sortFixtures(fixtures) {
  return [...fixtures].sort(
    (a, b) => parseFixtureInstant(a) - parseFixtureInstant(b)
  );
}

export function getFixtureDateKey(fixture, timeZone = DISPLAY_TIMEZONE) {
  const instant = parseFixtureInstant(fixture);
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}

export function formatDateHeading(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));

  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function groupFixturesByDate(fixturesByGroup, timeZone = DISPLAY_TIMEZONE) {
  const flattened = sortFixtures(flattenFixtures(fixturesByGroup));

  return flattened.reduce((acc, fixture) => {
    const dateKey = getFixtureDateKey(fixture, timeZone);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(fixture);
    return acc;
  }, {});
}

export function getDateKeys(fixturesByDate) {
  return Object.keys(fixturesByDate).sort((a, b) => a.localeCompare(b));
}

export function filterFixturesByGroup(fixturesByGroup, groupId) {
  if (!groupId || groupId === 'all') {
    return fixturesByGroup;
  }

  return {
    [groupId]: fixturesByGroup[groupId] ?? [],
  };
}

export function isFixturePast(fixture, now = new Date()) {
  return parseFixtureInstant(fixture) < now;
}

export function splitFixturesByDate(fixtures, now = new Date()) {
  const upcoming = [];
  const past = [];

  for (const fixture of fixtures) {
    if (isFixturePast(fixture, now)) {
      past.push(fixture);
    } else {
      upcoming.push(fixture);
    }
  }

  return {
    upcoming: sortFixtures(upcoming),
    past: sortFixtures(past).reverse(),
  };
}

export function getTodayDateKey(timeZone = DISPLAY_TIMEZONE, now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function getFixturesOnDate(
  fixturesByGroup,
  dateKey,
  timeZone = DISPLAY_TIMEZONE
) {
  return sortFixtures(
    flattenFixtures(fixturesByGroup).filter(
      (fixture) => getFixtureDateKey(fixture, timeZone) === dateKey
    )
  );
}

export function isFixtureComplete(fixture) {
  return fixture.homeScore != null && fixture.awayScore != null;
}

export const MATCH_DURATION_MS = 2 * 60 * 60 * 1000;

export function getFixtureEndInstant(fixture) {
  return new Date(parseFixtureInstant(fixture).getTime() + MATCH_DURATION_MS);
}

export function isFixtureOngoing(fixture, now = new Date()) {
  if (isFixtureComplete(fixture)) return false;

  const kickoff = parseFixtureInstant(fixture);
  const end = getFixtureEndInstant(fixture);

  return kickoff <= now && now < end;
}

export function getFixtureStatus(fixture, now = new Date()) {
  if (isFixtureComplete(fixture)) return 'completed';
  if (isFixtureOngoing(fixture, now)) return 'ongoing';

  const end = getFixtureEndInstant(fixture);
  if (now >= end) return 'past';

  return 'upcoming';
}

export function getFirstFixture(fixturesByGroup) {
  const sorted = sortFixtures(flattenFixtures(fixturesByGroup));
  return sorted[0] ?? null;
}

export function isTournamentStarted(fixturesByGroup, now = new Date()) {
  const first = getFirstFixture(fixturesByGroup);
  if (!first) {
    return true;
  }
  return parseFixtureInstant(first) <= now;
}

export function getLatestResults(
  fixturesByGroup,
  timeZone = DISPLAY_TIMEZONE,
  now = new Date()
) {
  const fixturesByDate = groupFixturesByDate(fixturesByGroup, timeZone);
  const dates = getDateKeys(fixturesByDate).reverse();

  for (const dateKey of dates) {
    const dayFixtures = fixturesByDate[dateKey];
    const completed = dayFixtures.filter(
      (fixture) => isFixturePast(fixture, now) && isFixtureComplete(fixture)
    );

    if (completed.length > 0) {
      return { dateKey, fixtures: completed };
    }

    const past = dayFixtures.filter((fixture) => isFixturePast(fixture, now));
    if (past.length > 0) {
      return { dateKey, fixtures: past };
    }
  }

  return null;
}
