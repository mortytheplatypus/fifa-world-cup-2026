export const DISPLAY_TIMEZONE = 'America/New_York';
export const TIMEZONE_STORAGE_KEY = 'fifa-wc-2026-timezone';

export const TIMEZONE_OPTIONS = [
  { value: 'Pacific/Honolulu', label: 'Hawaii' },
  { value: 'America/Anchorage', label: 'Alaska' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (US)' },
  { value: 'America/Vancouver', label: 'Vancouver' },
  { value: 'America/Denver', label: 'Mountain Time (US)' },
  { value: 'America/Chicago', label: 'Central Time (US)' },
  { value: 'America/Mexico_City', label: 'Mexico City' },
  { value: 'America/Monterrey', label: 'Monterrey' },
  { value: 'America/New_York', label: 'Eastern Time (US)' },
  { value: 'America/Toronto', label: 'Toronto' },
  { value: 'America/Sao_Paulo', label: 'São Paulo' },
  { value: 'Europe/London', label: 'London' },
  { value: 'Europe/Paris', label: 'Paris' },
  { value: 'Europe/Berlin', label: 'Berlin' },
  { value: 'Europe/Moscow', label: 'Moscow' },
  { value: 'Africa/Cairo', label: 'Cairo' },
  { value: 'Asia/Dubai', label: 'Dubai' },
  { value: 'Asia/Kolkata', label: 'India' },
  { value: 'Asia/Shanghai', label: 'China' },
  { value: 'Asia/Tokyo', label: 'Tokyo' },
  { value: 'Asia/Seoul', label: 'Seoul' },
  { value: 'Australia/Sydney', label: 'Sydney' },
  { value: 'Pacific/Auckland', label: 'Auckland' },
  { value: 'UTC', label: 'UTC' },
];

export function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

export function getTimezoneSelectOptions(preferredTimeZone) {
  const known = new Set(TIMEZONE_OPTIONS.map((option) => option.value));
  const options = [...TIMEZONE_OPTIONS];

  if (preferredTimeZone && !known.has(preferredTimeZone)) {
    options.unshift({
      value: preferredTimeZone,
      label: formatTimezoneOptionLabel(preferredTimeZone),
    });
  }

  return options;
}

export function formatTimezoneOptionLabel(timeZone) {
  const shortName = getDisplayTimezoneLabel(timeZone);
  const match = TIMEZONE_OPTIONS.find((option) => option.value === timeZone);
  if (match) {
    return `${match.label} (${shortName})`;
  }
  return `${timeZone.replace(/_/g, ' ')} (${shortName})`;
}

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

export function getVenueTimezone(city) {
  return CITY_TIMEZONES[city] ?? DISPLAY_TIMEZONE;
}

export function parseFixtureInstant(fixture) {
  const venueTimezone = getVenueTimezone(fixture.city);
  return zonedTimeToUtc(fixture.date, fixture.time, venueTimezone);
}

export function formatFixtureDate(fixture, timeZone = DISPLAY_TIMEZONE) {
  const instant = parseFixtureInstant(fixture);
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(instant);
}

export function formatFixtureTime(fixture, timeZone = DISPLAY_TIMEZONE) {
  const instant = parseFixtureInstant(fixture);
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(instant);
}

export function getDisplayTimezoneLabel(timeZone = DISPLAY_TIMEZONE) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'short',
  }).formatToParts(new Date());

  return parts.find((part) => part.type === 'timeZoneName')?.value ?? timeZone;
}
