/** @typedef {{ home: number, away: number }} KnockoutPenalties */

/**
 * @param {{ penalties?: { home?: number | null, away?: number | null } } | null | undefined} result
 * @returns {KnockoutPenalties | null}
 */
export function getKnockoutPenalties(result) {
  const penalties = result?.penalties;
  if (
    !penalties ||
    penalties.home == null ||
    penalties.away == null ||
    typeof penalties.home !== 'number' ||
    typeof penalties.away !== 'number'
  ) {
    return null;
  }

  return { home: penalties.home, away: penalties.away };
}

/**
 * Regulation score is tied and penalty shootout produced a winner.
 * @param {{ homeScore?: number | null, awayScore?: number | null, penalties?: { home?: number | null, away?: number | null } } | null | undefined} result
 */
export function isKnockoutPenaltyDecided(result) {
  if (result?.homeScore == null || result?.awayScore == null) {
    return false;
  }

  if (result.homeScore !== result.awayScore) {
    return false;
  }

  const penalties = getKnockoutPenalties(result);
  return Boolean(penalties && penalties.home !== penalties.away);
}

/**
 * @param {'home' | 'away' | 'A' | 'B'} side
 */
export function getKnockoutScoreParts(result, side) {
  const isHome = side === 'home' || side === 'A';
  const regulation = isHome ? result?.homeScore : result?.awayScore;
  const penalties = getKnockoutPenalties(result);
  const showPenalties =
    penalties != null &&
    result?.homeScore != null &&
    result.homeScore === result.awayScore;

  return {
    regulation,
    penalty: showPenalties ? (isHome ? penalties.home : penalties.away) : null,
  };
}
