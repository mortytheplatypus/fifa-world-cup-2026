/**
 * Shared venue timezone helpers for scripts — mirrors src/utils/timezone.js
 * so knockout seed data uses the same local-venue time convention as fixtures.
 */

const DISPLAY_TIMEZONE = 'America/New_York';

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

function getVenueTimezone(city) {
  return CITY_TIMEZONES[city] ?? DISPLAY_TIMEZONE;
}

function formatLocalTime(utcDate, timeZone) {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const parts = formatter.formatToParts(utcDate);
  const values = Object.fromEntries(
    parts.filter((p) => p.type !== 'literal').map((p) => [p.type, p.value])
  );
  return `${values.hour.padStart(2, '0')}:${values.minute.padStart(2, '0')}`;
}

/** Convert FIFA schedule ET kickoff to local venue time (HH:MM) used in fixtures API. */
function etKickoffToLocalTime(date, etTime, city) {
  const utc = zonedTimeToUtc(date, etTime, 'America/New_York');
  return formatLocalTime(utc, getVenueTimezone(city));
}

function loadVenuesFromFixtures(fixturesPath) {
  const fs = require('fs');
  const fixturesByGroup = JSON.parse(fs.readFileSync(fixturesPath, 'utf8'));
  const venues = {};

  for (const fixtures of Object.values(fixturesByGroup)) {
    for (const fixture of fixtures) {
      venues[fixture.venue] = fixture.city;
    }
  }

  return venues;
}

module.exports = {
  CITY_TIMEZONES,
  zonedTimeToUtc,
  getVenueTimezone,
  formatLocalTime,
  etKickoffToLocalTime,
  loadVenuesFromFixtures,
};
