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
  return Object.keys(fixturesByDate).sort();
}

export function filterFixturesByGroup(fixturesByGroup, groupId) {
  if (!groupId || groupId === 'all') {
    return fixturesByGroup;
  }

  return {
    [groupId]: fixturesByGroup[groupId] ?? [],
  };
}
