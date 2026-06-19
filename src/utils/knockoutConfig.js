/** When true, knockout views show resolved team names; otherwise slot labels (e.g. Winner A (1A)). */
export function isKnockoutTeamsRevealed() {
  return process.env.REACT_APP_KNOCKOUT_REVEAL_TEAMS === 'true';
}

/** When true, Home and Fixtures use knockout schedule instead of group-stage fixtures. */
export function isKnockoutScheduleMode() {
  return process.env.REACT_APP_KNOCKOUT_SCHEDULE === 'true';
}
