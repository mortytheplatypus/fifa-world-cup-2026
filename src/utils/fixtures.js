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

export function filterFixturesByTeam(fixturesByGroup, teamId) {
  if (!teamId) {
    return fixturesByGroup;
  }

  return Object.entries(fixturesByGroup).reduce((acc, [group, fixtures]) => {
    const filtered = fixtures.filter(
      (fixture) => fixture.homeTeam === teamId || fixture.awayTeam === teamId
    );

    if (filtered.length > 0) {
      acc[group] = filtered;
    }

    return acc;
  }, {});
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

export function getDayFixturesDisplayOrder(fixtures, now = new Date()) {
  const { upcoming, past } = splitFixturesByDate(fixtures, now);
  return [...past, ...upcoming];
}

export function getTomorrowDateKey(timeZone = DISPLAY_TIMEZONE, now = new Date()) {
  const todayKey = getTodayDateKey(timeZone, now);
  const [year, month, day] = todayKey.split('-').map(Number);
  const tomorrow = new Date(Date.UTC(year, month - 1, day + 1, 12, 0, 0));

  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(tomorrow);
}

function formatUpcomingActivityLabel(count) {
  return count === 1 ? 'Match upcoming' : 'Matches upcoming';
}

function formatActivityTitle(variant, count, upcomingToday = 0, upcomingTomorrow = 0) {
  if (variant === 'live') {
    return `${count} ${count === 1 ? 'match' : 'matches'} live now`;
  }

  if (variant === 'upcoming') {
    const parts = [];

    if (upcomingToday > 0) {
      parts.push(`${upcomingToday} today`);
    }

    if (upcomingTomorrow > 0) {
      parts.push(`${upcomingTomorrow} tomorrow`);
    }

    return `${count} upcoming ${count === 1 ? 'match' : 'matches'} (${parts.join(', ')})`;
  }

  return `${count} ${count === 1 ? 'result' : 'results'} from today`;
}

export function getGroupActivityIndicators(
  fixturesByGroup,
  timeZone = DISPLAY_TIMEZONE,
  now = new Date()
) {
  const todayKey = getTodayDateKey(timeZone, now);
  const tomorrowKey = getTomorrowDateKey(timeZone, now);
  const indicators = new Map();

  for (const [group, fixtures] of Object.entries(fixturesByGroup)) {
    let liveToday = 0;
    let upcomingToday = 0;
    let upcomingTomorrow = 0;
    let resultsToday = 0;

    for (const fixture of fixtures) {
      const dateKey = getFixtureDateKey(fixture, timeZone);
      const status = getFixtureStatus(fixture, now);

      if (status === 'ongoing' && dateKey === todayKey) {
        liveToday += 1;
        continue;
      }

      if (status === 'upcoming') {
        if (dateKey === todayKey) upcomingToday += 1;
        else if (dateKey === tomorrowKey) upcomingTomorrow += 1;
        continue;
      }

      if (
        dateKey === todayKey &&
        (status === 'completed' || status === 'past')
      ) {
        resultsToday += 1;
      }
    }

    const activities = [];

    if (liveToday > 0) {
      activities.push({
        variant: 'live',
        label: liveToday === 1 ? 'Live match' : 'Live matches',
        title: formatActivityTitle('live', liveToday),
      });
    }

    const upcomingCount = upcomingToday + upcomingTomorrow;

    if (upcomingCount > 0) {
      activities.push({
        variant: 'upcoming',
        label: formatUpcomingActivityLabel(upcomingCount),
        title: formatActivityTitle(
          'upcoming',
          upcomingCount,
          upcomingToday,
          upcomingTomorrow
        ),
      });
    }

    if (resultsToday > 0) {
      activities.push({
        variant: 'results',
        label: resultsToday === 1 ? 'Latest result' : 'Latest results',
        title: formatActivityTitle('results', resultsToday),
      });
    }

    if (activities.length > 0) {
      indicators.set(group, activities);
    }
  }

  return indicators;
}

export function filterGroupsByActivity(groups, groupActivity, activityFilter = 'all') {
  if (activityFilter === 'all') {
    return groups;
  }

  return groups.filter((group) => {
    const activities = groupActivity.get(group) ?? [];

    if (activities.length === 0) {
      return false;
    }

    switch (activityFilter) {
      case 'active':
        return true;
      case 'results':
        return activities.some((activity) => activity.variant === 'results');
      case 'upcoming':
        return activities.some(
          (activity) =>
            activity.variant === 'upcoming' || activity.variant === 'live'
        );
      default:
        return true;
    }
  });
}

export function getActivityFilterEmptyMessage(activityFilter) {
  switch (activityFilter) {
    case 'results':
      return 'No groups with latest results today.';
    case 'upcoming':
      return 'No groups with upcoming matches right now.';
    case 'active':
      return 'No groups with latest results or upcoming matches right now.';
    default:
      return '';
  }
}

export function getTodayDateKey(timeZone = DISPLAY_TIMEZONE, now = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

export function getDefaultDateIndex(
  dates,
  timeZone = DISPLAY_TIMEZONE,
  now = new Date()
) {
  if (dates.length === 0) return 0;

  const todayKey = getTodayDateKey(timeZone, now);
  const todayIndex = dates.indexOf(todayKey);

  if (todayIndex !== -1) {
    return todayIndex;
  }

  if (todayKey < dates[0]) {
    return 0;
  }

  if (todayKey > dates[dates.length - 1]) {
    return dates.length - 1;
  }

  const nextIndex = dates.findIndex((dateKey) => dateKey >= todayKey);
  return nextIndex === -1 ? dates.length - 1 : nextIndex;
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

export function isFixtureComplete(fixture, now = new Date()) {
  return (
    fixture.homeScore != null &&
    fixture.awayScore != null &&
    now >= getFixtureEndInstant(fixture)
  );
}

export const MATCH_DURATION_MS = 2 * 60 * 60 * 1000;

export function getFixtureEndInstant(fixture) {
  return new Date(parseFixtureInstant(fixture).getTime() + MATCH_DURATION_MS);
}

export function isFixtureOngoing(fixture, now = new Date()) {
  const kickoff = parseFixtureInstant(fixture);
  const end = getFixtureEndInstant(fixture);

  return kickoff <= now && now < end;
}

export function getFixtureStatus(fixture, now = new Date()) {
  const kickoff = parseFixtureInstant(fixture);
  const end = getFixtureEndInstant(fixture);

  if (now < kickoff) return 'upcoming';
  if (now < end) return 'ongoing';
  if (fixture.homeScore != null && fixture.awayScore != null) return 'completed';

  return 'past';
}

export function getFirstFixture(fixturesByGroup) {
  const sorted = sortFixtures(flattenFixtures(fixturesByGroup));
  return sorted[0] ?? null;
}

export function getOngoingFixtures(fixturesByGroup, now = new Date()) {
  return sortFixtures(flattenFixtures(fixturesByGroup)).filter((fixture) =>
    isFixtureOngoing(fixture, now)
  );
}

export function getNextUpcomingFixture(fixturesByGroup, now = new Date()) {
  return (
    sortFixtures(flattenFixtures(fixturesByGroup)).find(
      (fixture) => getFixtureStatus(fixture, now) === 'upcoming'
    ) ?? null
  );
}

export function isTournamentStarted(fixturesByGroup, now = new Date()) {
  const first = getFirstFixture(fixturesByGroup);
  if (!first) {
    return true;
  }
  return parseFixtureInstant(first) <= now;
}

export function getUpcomingMatchesDay(
  fixturesByGroup,
  timeZone = DISPLAY_TIMEZONE,
  now = new Date(),
  { excludeFixtureId = null } = {}
) {
  const fixturesByDate = groupFixturesByDate(fixturesByGroup, timeZone);
  const dateKeys = getDateKeys(fixturesByDate);
  const todayKey = getTodayDateKey(timeZone, now);
  const eligibleDates = dateKeys.filter((dateKey) => dateKey >= todayKey);

  for (const dateKey of eligibleDates) {
    const dayUpcoming = fixturesByDate[dateKey].filter(
      (fixture) => getFixtureStatus(fixture, now) === 'upcoming'
    );

    if (dayUpcoming.length === 0) {
      continue;
    }

    const fixtures = dayUpcoming.filter(
      (fixture) => !excludeFixtureId || fixture.id !== excludeFixtureId
    );

    if (fixtures.length === 0) {
      continue;
    }

    return { dateKey, fixtures: sortFixtures(fixtures) };
  }

  return null;
}

export function getLatestResults(
  fixturesByGroup,
  timeZone = DISPLAY_TIMEZONE,
  now = new Date()
) {
  const fixturesByDate = groupFixturesByDate(fixturesByGroup, timeZone);
  const todayKey = getTodayDateKey(timeZone, now);

  function getStartedFixturesForDate(dateKey) {
    const dayFixtures = fixturesByDate[dateKey] ?? [];
    return sortFixtures(
      dayFixtures.filter(
        (fixture) => getFixtureStatus(fixture, now) !== 'upcoming'
      )
    ).reverse();
  }

  const todayStarted = getStartedFixturesForDate(todayKey);
  if (todayStarted.length > 0) {
    return { dateKey: todayKey, fixtures: todayStarted };
  }

  const pastDates = getDateKeys(fixturesByDate)
    .filter((dateKey) => dateKey < todayKey)
    .reverse();

  for (const dateKey of pastDates) {
    const started = getStartedFixturesForDate(dateKey);
    if (started.length > 0) {
      return { dateKey, fixtures: started };
    }
  }

  return null;
}
