/**
 * Official FIFA World Cup 2026 knockout schedule.
 * Venues: fifa.com match schedule article.
 * Kickoff times: FIFA FWC26 Match Schedule PDF (Eastern Time).
 * Local times use the same venue-city → IANA mapping as src/utils/timezone.js
 * and public/data/fixtures.json (same as /api/fixtures).
 */

const path = require('path');
const { etKickoffToLocalTime, loadVenuesFromFixtures } = require('./venue-time');

const FIXTURES_PATH = path.join(__dirname, '..', 'public', 'data', 'fixtures.json');
const VENUE_CITIES = loadVenuesFromFixtures(FIXTURES_PATH);

/** matchId → { date, etTime (HH:MM ET), venue } — venue string matches fixtures.json */
const KNOCKOUT_SCHEDULE_ET = {
  M73: { date: '2026-06-28', etTime: '15:00', venue: 'Los Angeles Stadium' },
  M74: { date: '2026-06-29', etTime: '16:30', venue: 'Boston Stadium' },
  M75: { date: '2026-06-29', etTime: '21:00', venue: 'Monterrey Stadium' },
  M76: { date: '2026-06-29', etTime: '13:00', venue: 'Houston Stadium' },
  M77: { date: '2026-06-30', etTime: '17:00', venue: 'New York/New Jersey Stadium' },
  M78: { date: '2026-06-30', etTime: '13:00', venue: 'Dallas Stadium' },
  M79: { date: '2026-06-30', etTime: '21:00', venue: 'Mexico City Stadium' },
  M80: { date: '2026-07-01', etTime: '12:00', venue: 'Atlanta Stadium' },
  M81: { date: '2026-07-01', etTime: '20:00', venue: 'San Francisco Bay Area Stadium' },
  M82: { date: '2026-07-01', etTime: '16:00', venue: 'Seattle Stadium' },
  M83: { date: '2026-07-02', etTime: '19:00', venue: 'Toronto Stadium' },
  M84: { date: '2026-07-02', etTime: '15:00', venue: 'Los Angeles Stadium' },
  M85: { date: '2026-07-02', etTime: '23:00', venue: 'BC Place Vancouver' },
  M86: { date: '2026-07-03', etTime: '18:00', venue: 'Miami Stadium' },
  M87: { date: '2026-07-03', etTime: '21:30', venue: 'Kansas City Stadium' },
  M88: { date: '2026-07-03', etTime: '14:00', venue: 'Dallas Stadium' },
  M89: { date: '2026-07-04', etTime: '17:00', venue: 'Philadelphia Stadium' },
  M90: { date: '2026-07-04', etTime: '13:00', venue: 'Houston Stadium' },
  M91: { date: '2026-07-05', etTime: '16:00', venue: 'New York/New Jersey Stadium' },
  M92: { date: '2026-07-05', etTime: '20:00', venue: 'Mexico City Stadium' },
  M93: { date: '2026-07-06', etTime: '15:00', venue: 'Dallas Stadium' },
  M94: { date: '2026-07-06', etTime: '20:00', venue: 'Seattle Stadium' },
  M95: { date: '2026-07-07', etTime: '12:00', venue: 'Atlanta Stadium' },
  M96: { date: '2026-07-07', etTime: '16:00', venue: 'BC Place Vancouver' },
  M97: { date: '2026-07-09', etTime: '16:00', venue: 'Boston Stadium' },
  M98: { date: '2026-07-10', etTime: '15:00', venue: 'Los Angeles Stadium' },
  M99: { date: '2026-07-11', etTime: '17:00', venue: 'Miami Stadium' },
  M100: { date: '2026-07-11', etTime: '21:00', venue: 'Kansas City Stadium' },
  M101: { date: '2026-07-14', etTime: '15:00', venue: 'Dallas Stadium' },
  M102: { date: '2026-07-15', etTime: '15:00', venue: 'Atlanta Stadium' },
  M103: { date: '2026-07-18', etTime: '17:00', venue: 'Miami Stadium' },
  M104: { date: '2026-07-19', etTime: '15:00', venue: 'New York/New Jersey Stadium' },
};

function buildKnockoutScheduleFields(matchId) {
  const entry = KNOCKOUT_SCHEDULE_ET[matchId];
  if (!entry) {
    throw new Error(`No schedule data for ${matchId}`);
  }

  const city = VENUE_CITIES[entry.venue];
  if (!city) {
    throw new Error(`Unknown venue "${entry.venue}" for ${matchId}`);
  }

  return {
    date: entry.date,
    time: etKickoffToLocalTime(entry.date, entry.etTime, city),
    venue: entry.venue,
    city,
  };
}

module.exports = {
  KNOCKOUT_SCHEDULE_ET,
  buildKnockoutScheduleFields,
};
