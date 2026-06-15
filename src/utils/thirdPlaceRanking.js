import { GROUP_LETTERS } from './data';

function compareThirdPlace(a, b) {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  return a.team.name.localeCompare(b.team.name);
}

/**
 * Rank all 12 third-placed teams across groups.
 * Uses points, goal difference, goals for, then team name.
 * Conduct score and FIFA ranking tiebreakers are not applied (data unavailable).
 */
export function rankThirdPlaceTeams(standingsByGroup) {
  const thirdPlaceTeams = GROUP_LETTERS.map((group) => {
    const standing = standingsByGroup[group]?.[2];
    if (!standing) return null;

    return {
      group,
      team: standing.team,
      played: standing.played,
      won: standing.won,
      drawn: standing.drawn,
      lost: standing.lost,
      goalsFor: standing.goalsFor,
      goalsAgainst: standing.goalsAgainst,
      goalDifference: standing.goalDifference,
      points: standing.points,
    };
  }).filter(Boolean);

  const sorted = [...thirdPlaceTeams].sort(compareThirdPlace);

  return sorted.map((entry, index) => ({
    ...entry,
    rank: index + 1,
    qualifies: index < 8,
  }));
}
