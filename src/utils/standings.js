function createEmptyStanding(team) {
  return {
    team,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
  };
}

function sortStandings(standings) {
  return [...standings].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.name.localeCompare(b.team.name);
  });
}

export function computeGroupStandings(teams, groupFixtures = []) {
  const standingsMap = new Map(
    teams.map((team) => [team.id, createEmptyStanding(team)])
  );

  for (const fixture of groupFixtures) {
    const { homeScore, awayScore } = fixture;
    if (homeScore == null || awayScore == null) continue;

    const home = standingsMap.get(fixture.homeTeam);
    const away = standingsMap.get(fixture.awayTeam);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.goalsFor += homeScore;
    home.goalsAgainst += awayScore;
    away.goalsFor += awayScore;
    away.goalsAgainst += homeScore;

    if (homeScore > awayScore) {
      home.won += 1;
      home.points += 3;
      away.lost += 1;
    } else if (homeScore < awayScore) {
      away.won += 1;
      away.points += 3;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
    }
  }

  const standings = Array.from(standingsMap.values()).map((row) => ({
    ...row,
    goalDifference: row.goalsFor - row.goalsAgainst,
  }));

  return sortStandings(standings);
}
