/** When true, knockout views show resolved team names; otherwise slot labels (e.g. Winner A (1A)). */
export function isKnockoutTeamsRevealed() {
  return process.env.REACT_APP_KNOCKOUT_REVEAL_TEAMS === 'true';
}
