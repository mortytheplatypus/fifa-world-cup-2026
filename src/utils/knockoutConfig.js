/** When true, Home and Fixtures use knockout schedule instead of group-stage fixtures. */
export function isKnockoutScheduleMode() {
  return process.env.REACT_APP_KNOCKOUT_SCHEDULE === 'true';
}
