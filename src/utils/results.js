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
        };
      }),
    ])
  );
}
