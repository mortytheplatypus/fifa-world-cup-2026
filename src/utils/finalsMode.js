import { flattenFixtures, getFixtureStatus, getTodayDateKey } from './fixtures';
import { getKnockoutSideOutcome } from './knockout';
import { isKnockoutScheduleMode } from './knockoutConfig';

export const FINALS_MATCH_IDS = {
  SF1: 'M101',
  SF2: 'M102',
  THIRD: 'M103',
  FINAL: 'M104',
};

const FINALS_STAGE_RESULT_IDS = [
  FINALS_MATCH_IDS.SF1,
  FINALS_MATCH_IDS.SF2,
  FINALS_MATCH_IDS.THIRD,
];

const DEFAULT_FINALS_MODE_START = '2026-07-17';

export function getFinalsModeStartDate() {
  return process.env.REACT_APP_FINALS_MODE_START ?? DEFAULT_FINALS_MODE_START;
}

export function isFinalsMode(timeZone, now = new Date()) {
  if (!isKnockoutScheduleMode()) {
    return false;
  }

  const todayKey = getTodayDateKey(timeZone, now);
  return todayKey >= getFinalsModeStartDate();
}

export function getFixtureById(fixturesByGroup, id) {
  return flattenFixtures(fixturesByGroup).find((fixture) => fixture.id === id) ?? null;
}

export function getFinalsStageResults(fixturesByGroup, now = new Date()) {
  return FINALS_STAGE_RESULT_IDS.map((id) => getFixtureById(fixturesByGroup, id))
    .filter(Boolean)
    .filter((fixture) => getFixtureStatus(fixture, now) !== 'upcoming');
}

/** Third-place play-off while still upcoming (final is reserved for the hero). */
export function getFinalsUpcomingFixture(fixturesByGroup, now = new Date()) {
  const thirdPlace = getFixtureById(fixturesByGroup, FINALS_MATCH_IDS.THIRD);
  if (!thirdPlace) {
    return null;
  }

  if (getFixtureStatus(thirdPlace, now) === 'upcoming') {
    return thirdPlace;
  }

  return null;
}

export function getFinalWinnerTeam(finalFixture, homeTeam, awayTeam) {
  if (!finalFixture || !homeTeam || !awayTeam) {
    return null;
  }

  if (getKnockoutSideOutcome(finalFixture, 'A') === 'winner') {
    return homeTeam;
  }

  if (getKnockoutSideOutcome(finalFixture, 'B') === 'winner') {
    return awayTeam;
  }

  return null;
}

export function getFinalsHeroVariant(finalFixture, now = new Date()) {
  if (!finalFixture) {
    return null;
  }

  const status = getFixtureStatus(finalFixture, now);

  if (status === 'completed') {
    return 'winner';
  }

  if (status === 'ongoing') {
    return 'live';
  }

  return 'countdown';
}
