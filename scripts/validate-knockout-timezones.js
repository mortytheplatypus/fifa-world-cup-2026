/**
 * Verify knockout schedule times use the same local-venue convention as fixtures API.
 * Run: node scripts/validate-knockout-timezones.js
 */

const fs = require('fs');
const path = require('path');
const { buildKnockoutScheduleFields } = require('./knockout-schedule-data');
const { zonedTimeToUtc, formatLocalTime, getVenueTimezone } = require('./venue-time');

const FIXTURES_PATH = path.join(__dirname, '..', 'public', 'data', 'fixtures.json');
const KNOCKOUTS_PATH = path.join(__dirname, '..', 'public', 'data', 'knockouts.json');

/** FIFA PDF kickoffs in Eastern Time — cross-check against fixtures.json local times */
const ET_ANCHORS = [
  { label: 'A-1 Mexico City', date: '2026-06-11', etTime: '15:00', city: 'Mexico City', expectedLocal: '13:00' },
  { label: 'D-1 Los Angeles', date: '2026-06-12', etTime: '21:00', city: 'Los Angeles', expectedLocal: '18:00' },
  { label: 'B-3 Los Angeles', date: '2026-06-18', etTime: '15:00', city: 'Los Angeles', expectedLocal: '12:00' },
  { label: 'E-1 Houston', date: '2026-06-14', etTime: '13:00', city: 'Houston', expectedLocal: '12:00' },
  { label: 'F-1 Dallas', date: '2026-06-14', etTime: '16:00', city: 'Arlington', expectedLocal: '15:00' },
  { label: 'C-1 East Rutherford', date: '2026-06-13', etTime: '18:00', city: 'East Rutherford', expectedLocal: '18:00' },
  { label: 'F-2 Monterrey', date: '2026-06-14', etTime: '22:00', city: 'Monterrey', expectedLocal: '20:00' },
  { label: 'D-2 Vancouver', date: '2026-06-14', etTime: '00:00', city: 'Vancouver', expectedLocal: '21:00' },
  { label: 'J-2 Santa Clara', date: '2026-06-17', etTime: '00:00', city: 'Santa Clara', expectedLocal: '21:00' },
];

function flattenFixtures(fixturesByGroup) {
  return Object.values(fixturesByGroup).flat();
}

function main() {
  const fixtures = JSON.parse(fs.readFileSync(FIXTURES_PATH, 'utf8'));
  const knockouts = JSON.parse(fs.readFileSync(KNOCKOUTS_PATH, 'utf8'));
  let failed = 0;

  console.log('1) ET → local conversion vs fixtures anchors\n');
  for (const anchor of ET_ANCHORS) {
    const tz = getVenueTimezone(anchor.city);
    const utc = zonedTimeToUtc(anchor.date, anchor.etTime, 'America/New_York');
    const local = formatLocalTime(utc, tz);
    const ok = local === anchor.expectedLocal;
    if (!ok) failed += 1;
    console.log(
      `  ${ok ? '✓' : '✗'} ${anchor.label}: ET ${anchor.etTime} → ${local} (expected ${anchor.expectedLocal})`
    );
  }

  console.log('\n2) Knockout venue/city strings match fixtures.json\n');
  const fixtureVenues = new Map(
    flattenFixtures(fixtures).map((f) => [f.venue, f.city])
  );

  for (const doc of knockouts) {
    const expectedCity = fixtureVenues.get(doc.venue);
    const cityOk = expectedCity === doc.city;
    if (!cityOk) {
      failed += 1;
      console.log(
        `  ✗ ${doc._id}: venue "${doc.venue}" city "${doc.city}" (fixtures has "${expectedCity ?? 'unknown'}")`
      );
    }
  }
  if (failed === 0) {
    console.log('  ✓ All 32 knockout venue/city pairs match fixtures.json');
  }

  console.log('\n3) Knockout times round-trip through app parseFixtureInstant logic\n');
  for (const doc of knockouts) {
    const rebuilt = buildKnockoutScheduleFields(doc._id);
    const tz = getVenueTimezone(rebuilt.city);
    const utc = zonedTimeToUtc(rebuilt.date, rebuilt.time, tz);
    const roundTrip = formatLocalTime(utc, tz);
    const ok = roundTrip === rebuilt.time && rebuilt.time === doc.time;
    if (!ok) {
      failed += 1;
      console.log(`  ✗ ${doc._id}: json=${doc.time} rebuilt=${rebuilt.time} roundTrip=${roundTrip}`);
    }
  }
  if (failed === 0) {
    console.log('  ✓ All knockout times are valid local venue times');
  }

  if (failed > 0) {
    process.exit(1);
  }

  console.log('\nAll checks passed — knockout data matches fixtures API timezone convention.');
}

main();
