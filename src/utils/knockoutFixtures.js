import { GROUP_LETTERS } from './data';
import {
  KNOCKOUT_MATCH_DATES,
  KNOCKOUT_MATCH_IDS,
  getKnockoutMatchTag,
  resolveKnockoutMatch,
} from './knockout';
import { isKnockoutTeamsRevealed } from './knockoutConfig';
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

  const date = schedule.date ?? KNOCKOUT_MATCH_DATES[matchId] ?? null;
  if (!date) {
    return null;
  }

  return {
    id: matchId,
    matchday: 0,
    homeTeam: homeTeamId,
    awayTeam: awayTeamId,
    date,
    time: schedule.time ?? DEFAULT_KNOCKOUT_TIME,
    venue: schedule.venue ?? DEFAULT_KNOCKOUT_VENUE,
    city: schedule.city ?? DEFAULT_KNOCKOUT_CITY,
    round: resolvedMatch.round,
    knockoutTag: schedule.tag ?? getKnockoutMatchTag(matchId),
    isKnockout: true,
    homeScore: schedule.homeScore ?? null,
    awayScore: schedule.awayScore ?? null,
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
  const revealTeams = isKnockoutTeamsRevealed();
  const options = { revealTeams, knockoutResults };
  const fixtures = [];

  for (const matchId of KNOCKOUT_MATCH_IDS) {
    const resolvedMatch = resolveKnockoutMatch(matchId, standingsByGroup, options);
    if (!resolvedMatch) {
      continue;
    }

    const schedule = knockoutResults[matchId] ?? {};
    const fixture = buildKnockoutFixture(matchId, resolvedMatch, schedule);
    if (fixture) {
      fixtures.push(fixture);
    }
  }

  return { knockout: fixtures };
}
