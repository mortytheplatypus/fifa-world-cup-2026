const fs = require('fs');
const path = require('path');

const FIXTURES_PATH = path.join(__dirname, '..', '..', '..', 'public', 'data', 'fixtures.json');
const USA_TIMEZONE = 'America/New_York';
const KICKOFF_DELAY_MS = 3 * 60 * 60 * 1000;

const CITY_TIMEZONES = {
  'Mexico City': 'America/Mexico_City',
  Guadalajara: 'America/Mexico_City',
  Monterrey: 'America/Monterrey',
  Toronto: 'America/Toronto',
  Vancouver: 'America/Vancouver',
  'East Rutherford': 'America/New_York',
  Foxborough: 'America/New_York',
  Philadelphia: 'America/New_York',
  'Los Angeles': 'America/Los_Angeles',
  'Santa Clara': 'America/Los_Angeles',
  Seattle: 'America/Los_Angeles',
  Arlington: 'America/Chicago',
  Houston: 'America/Chicago',
  'Kansas City': 'America/Chicago',
  Atlanta: 'America/New_York',
  'Miami Gardens': 'America/New_York',
};

let cachedKickoffs = null;
let cachedUsaDayIndex = null;

function getVenueTimezone(city) {
  return CITY_TIMEZONES[city] ?? USA_TIMEZONE;
}

function zonedTimeToUtc(dateStr, timeStr, timeZone) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hour, minute] = timeStr.split(':').map(Number);

  let ms = Date.UTC(year, month - 1, day, hour, minute);
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });

  function getParts(date) {
    const parts = formatter.formatToParts(date);
    const values = {};
    for (const part of parts) {
      if (part.type !== 'literal') {
        values[part.type] = part.value;
      }
    }
    return {
      year: Number(values.year),
      month: Number(values.month),
      day: Number(values.day),
      hour: Number(values.hour),
      minute: Number(values.minute),
    };
  }

  for (let i = 0; i < 2; i += 1) {
    const parts = getParts(new Date(ms));
    const asUtc = Date.UTC(
      parts.year,
      parts.month - 1,
      parts.day,
      parts.hour,
      parts.minute
    );
    const desired = Date.UTC(year, month - 1, day, hour, minute);
    ms += desired - asUtc;
  }

  return new Date(ms);
}

function parseFixtureInstant(fixture) {
  const venueTimezone = getVenueTimezone(fixture.city);
  return zonedTimeToUtc(fixture.date, fixture.time, venueTimezone);
}

function getUsaDateKey(instant, timeZone = USA_TIMEZONE) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}

function loadFixturesByGroup() {
  return JSON.parse(fs.readFileSync(FIXTURES_PATH, 'utf8'));
}

function loadKickoffIndex() {
  if (cachedKickoffs) {
    return cachedKickoffs;
  }

  const fixturesByGroup = loadFixturesByGroup();
  const index = {};

  for (const fixtures of Object.values(fixturesByGroup)) {
    for (const fixture of fixtures) {
      index[fixture.id] = parseFixtureInstant(fixture);
    }
  }

  cachedKickoffs = index;
  return index;
}

/**
 * USA Eastern calendar day → { lastKickoff, fixtureIds, syncAt }.
 */
function loadUsaDayIndex() {
  if (cachedUsaDayIndex) {
    return cachedUsaDayIndex;
  }

  const fixturesByGroup = loadFixturesByGroup();
  const kickoffs = loadKickoffIndex();
  const index = {};

  for (const fixtures of Object.values(fixturesByGroup)) {
    for (const fixture of fixtures) {
      const instant = kickoffs[fixture.id];
      const usaDay = getUsaDateKey(instant);

      if (!index[usaDay]) {
        index[usaDay] = {
          lastKickoff: instant,
          fixtureIds: [fixture.id],
          syncAt: new Date(instant.getTime() + KICKOFF_DELAY_MS),
        };
        continue;
      }

      index[usaDay].fixtureIds.push(fixture.id);
      if (instant > index[usaDay].lastKickoff) {
        index[usaDay].lastKickoff = instant;
        index[usaDay].syncAt = new Date(instant.getTime() + KICKOFF_DELAY_MS);
      }
    }
  }

  cachedUsaDayIndex = index;
  return index;
}

function getUsaMatchDaysSorted() {
  return Object.keys(loadUsaDayIndex()).sort();
}

function getSyncInstantForUsaDay(usaDay) {
  return loadUsaDayIndex()[usaDay]?.syncAt ?? null;
}

function isUsaDaySyncDue(usaDay, now = new Date()) {
  const syncAt = getSyncInstantForUsaDay(usaDay);
  if (!syncAt) {
    return false;
  }
  return now.getTime() >= syncAt.getTime();
}

function getFixtureIdsForUsaDay(usaDay) {
  return loadUsaDayIndex()[usaDay]?.fixtureIds ?? [];
}

/**
 * Latest match day (USA ET) whose last kickoff + 3h has passed and is after lastSynced.
 */
function getNextUsaMatchDayToSync(now = new Date(), lastSynced = null) {
  let candidate = null;

  for (const usaDay of getUsaMatchDaysSorted()) {
    if (lastSynced && usaDay <= lastSynced) {
      continue;
    }
    if (!isUsaDaySyncDue(usaDay, now)) {
      continue;
    }
    candidate = usaDay;
  }

  return candidate;
}

/** UTC hour for daily Vercel cron (latest USA-day sync instant across the tournament). */
function getDailyCronUtcHour() {
  const index = loadUsaDayIndex();
  let maxHour = 0;
  let maxMinute = 0;

  for (const { syncAt } of Object.values(index)) {
    const hour = syncAt.getUTCHours();
    const minute = syncAt.getUTCMinutes();

    if (hour > maxHour || (hour === maxHour && minute > maxMinute)) {
      maxHour = hour;
      maxMinute = minute;
    }
  }

  return maxHour;
}

function isKickoffDelayElapsed(fixtureId, now = new Date()) {
  const kickoffs = loadKickoffIndex();
  const kickoff = kickoffs[fixtureId];

  if (!kickoff) {
    return false;
  }

  return now.getTime() >= kickoff.getTime() + KICKOFF_DELAY_MS;
}

module.exports = {
  USA_TIMEZONE,
  loadKickoffIndex,
  loadUsaDayIndex,
  getUsaDateKey,
  getUsaMatchDaysSorted,
  getSyncInstantForUsaDay,
  isUsaDaySyncDue,
  getFixtureIdsForUsaDay,
  getNextUsaMatchDayToSync,
  getDailyCronUtcHour,
  isKickoffDelayElapsed,
  KICKOFF_DELAY_MS,
};
