export function sortGoals(goals = []) {
  return [...goals].sort((a, b) => a.minute - b.minute);
}

export function getGoalsBySide(goals = []) {
  const sorted = sortGoals(goals);

  return {
    home: sorted.filter((goal) => goal.team === 'home'),
    away: sorted.filter((goal) => goal.team === 'away'),
  };
}

export function applyMatchResults(fixturesByGroup, results) {
  const matchResults = results?.matches ?? {};

  return Object.fromEntries(
    Object.entries(fixturesByGroup).map(([group, fixtures]) => [
      group,
      fixtures.map((fixture) => {
        const result = matchResults[fixture.id];
        if (!result) return fixture;

        return {
          ...fixture,
          homeScore: result.homeScore,
          awayScore: result.awayScore,
          goals: result.goals ?? [],
        };
      }),
    ])
  );
}
