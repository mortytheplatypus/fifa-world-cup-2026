import { GROUP_LETTERS } from './data';
import {
  KNOCKOUT_MATCH_IDS,
  getKnockoutSchedule,
  resolveKnockoutMatch,
} from './knockout';
import { computeGroupStandings } from './standings';

const DEFAULT_KNOCKOUT_TIME = '12:00';
const DEFAULT_KNOCKOUT_CITY = 'East Rutherford';
const DEFAULT_KNOCKOUT_VENUE = 'TBD';

function slotToTeamId(resolved) {
  if (resolved.type === 'team' && resolved.team?.id) {
    return resolved.team.id;
  }
  return null;
}

function buildKnockoutFixture(matchId, resolvedMatch, schedule = {}) {
  const homeTeamId = slotToTeamId(resolvedMatch.resolvedA);
  const awayTeamId = slotToTeamId(resolvedMatch.resolvedB);

  if (!homeTeamId || !awayTeamId) {
    return null;
  }

  if (!schedule.date) {
    return null;
  }

  return {
    id: matchId,
    matchday: 0,
    homeTeam: homeTeamId,
    awayTeam: awayTeamId,
    date: schedule.date,
    time: schedule.time ?? DEFAULT_KNOCKOUT_TIME,
    venue: schedule.venue ?? DEFAULT_KNOCKOUT_VENUE,
    city: schedule.city ?? DEFAULT_KNOCKOUT_CITY,
    round: resolvedMatch.round,
    knockoutTag: schedule.tag,
    isKnockout: true,
    homeScore: schedule.homeScore ?? null,
    awayScore: schedule.awayScore ?? null,
    ...(schedule.penalties?.home != null && schedule.penalties?.away != null
      ? { penalties: schedule.penalties }
      : {}),
    ...(schedule.goals?.length ? { goals: schedule.goals } : {}),
    ...(schedule.cards?.length ? { cards: schedule.cards } : {}),
  };
}

export function buildStandingsByGroup(groupedTeams, fixturesByGroup) {
  return GROUP_LETTERS.reduce((acc, letter) => {
    acc[letter] = computeGroupStandings(
      groupedTeams[letter] ?? [],
      fixturesByGroup[letter] ?? []
    );
    return acc;
  }, {});
}

/**
 * Build fixture-shaped knockout matches for Home/Fixtures schedule views.
 * Only includes matches where both sides resolve to a team.
 */
export function buildKnockoutFixtures(standingsByGroup, knockoutResults = {}) {
  const options = { knockoutResults };
  const fixtures = [];

  for (const matchId of KNOCKOUT_MATCH_IDS) {
    const resolvedMatch = resolveKnockoutMatch(matchId, standingsByGroup, options);
    if (!resolvedMatch) {
      continue;
    }

    const schedule = getKnockoutSchedule(matchId, knockoutResults);
    const fixture = buildKnockoutFixture(matchId, resolvedMatch, schedule);
    if (fixture) {
      fixtures.push(fixture);
    }
  }

  return { knockout: fixtures };
}
