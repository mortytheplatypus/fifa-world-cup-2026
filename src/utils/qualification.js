import { rankThirdPlaceTeams } from './thirdPlaceRanking';

export const QUALIFICATION_DETAILS = [
  '1st and 2nd place in every group qualify automatically.',
  'Among the 12 third-place teams, the 8 with the best records also qualify.',
];

/** @returns {Map<string, { rank: number, qualifies: boolean }>} */
export function buildThirdPlaceQualificationByGroup(standingsByGroup) {
  const ranking = rankThirdPlaceTeams(standingsByGroup);

  return new Map(
    ranking.map((entry) => [
      entry.group,
      { rank: entry.rank, qualifies: entry.qualifies },
    ])
  );
}

export function getThirdPlaceQualificationHint({ rank, qualifies }) {
  if (qualifies) {
    return `Qualified: ranked ${rank} of 12 third-place teams (top 8).`;
  }

  return `Did not qualify: ranked ${rank} of 12 third-place teams (outside top 8).`;
}
