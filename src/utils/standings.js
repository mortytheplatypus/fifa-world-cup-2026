const CARD_DEDUCTIONS = {
  yellow: -1,
  secondYellow: -3,
  directRed: -4,
  yellowAndDirectRed: -5,
};

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

function isPlayedFixture(fixture) {
  return fixture.homeScore != null && fixture.awayScore != null;
}

function fixtureInvolvesTeams(fixture, teamIds) {
  const ids = new Set(teamIds);
  return ids.has(fixture.homeTeam) && ids.has(fixture.awayTeam);
}

function getMiniLeagueStats(teamId, teamIds, fixtures) {
  const stats = { points: 0, goalDifference: 0, goalsFor: 0 };

  for (const fixture of fixtures) {
    if (!isPlayedFixture(fixture) || !fixtureInvolvesTeams(fixture, teamIds)) {
      continue;
    }

    const isHome = fixture.homeTeam === teamId;
    const goalsFor = isHome ? fixture.homeScore : fixture.awayScore;
    const goalsAgainst = isHome ? fixture.awayScore : fixture.homeScore;

    stats.goalsFor += goalsFor;
    stats.goalDifference += goalsFor - goalsAgainst;

    if (goalsFor > goalsAgainst) {
      stats.points += 3;
    } else if (goalsFor === goalsAgainst) {
      stats.points += 1;
    }
  }

  return stats;
}

function getCardDeduction(type) {
  return CARD_DEDUCTIONS[type] ?? 0;
}

export function computeConductScore(teamId, fixtures) {
  let score = 0;

  for (const fixture of fixtures) {
    if (!isPlayedFixture(fixture)) {
      continue;
    }

    const side =
      fixture.homeTeam === teamId ? 'home' : fixture.awayTeam === teamId ? 'away' : null;
    if (!side) {
      continue;
    }

    for (const card of fixture.cards ?? []) {
      if (card.team === side) {
        score += getCardDeduction(card.type);
      }
    }
  }

  return score;
}

function compareByFifaRanking(a, b) {
  const rankA = a.team.fifaRankingPreWc ?? Number.MAX_SAFE_INTEGER;
  const rankB = b.team.fifaRankingPreWc ?? Number.MAX_SAFE_INTEGER;
  if (rankA !== rankB) return rankA - rankB;
  return a.team.id.localeCompare(b.team.id);
}

function groupByEqualValue(rows, getValue) {
  const groups = [];
  let currentGroup = [];
  let currentValue = null;

  for (const row of rows) {
    const value = getValue(row);
    if (currentGroup.length === 0 || value === currentValue) {
      currentGroup.push(row);
      currentValue = value;
    } else {
      groups.push(currentGroup);
      currentGroup = [row];
      currentValue = value;
    }
  }

  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  return groups;
}

function compareMiniLeagueStats(statsA, statsB) {
  if (statsB.points !== statsA.points) return statsB.points - statsA.points;
  if (statsB.goalDifference !== statsA.goalDifference) {
    return statsB.goalDifference - statsA.goalDifference;
  }
  return statsB.goalsFor - statsA.goalsFor;
}

function sortByMiniLeague(rows, teamIds, fixtures) {
  return [...rows].sort((a, b) => {
    const statsA = getMiniLeagueStats(a.team.id, teamIds, fixtures);
    const statsB = getMiniLeagueStats(b.team.id, teamIds, fixtures);
    return compareMiniLeagueStats(statsA, statsB);
  });
}

function sortByOverallRecord(rows) {
  return [...rows].sort((a, b) => {
    if (b.goalDifference !== a.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    return b.goalsFor - a.goalsFor;
  });
}

function sortByConduct(rows, fixtures) {
  return [...rows].sort(
    (a, b) =>
      computeConductScore(b.team.id, fixtures) - computeConductScore(a.team.id, fixtures)
  );
}

function rankTiedTeams(tiedRows, fixtures) {
  if (tiedRows.length <= 1) {
    return tiedRows;
  }

  const teamIds = tiedRows.map((row) => row.team.id);
  const ranked = [];

  const step1Groups = groupByEqualValue(
    sortByMiniLeague(tiedRows, teamIds, fixtures),
    (row) => {
      const stats = getMiniLeagueStats(row.team.id, teamIds, fixtures);
      return `${stats.points}|${stats.goalDifference}|${stats.goalsFor}`;
    }
  );

  for (const step1Group of step1Groups) {
    if (step1Group.length === 1) {
      ranked.push(step1Group[0]);
      continue;
    }

    const subsetIds = step1Group.map((row) => row.team.id);
    const step2MiniGroups = groupByEqualValue(
      sortByMiniLeague(step1Group, subsetIds, fixtures),
      (row) => {
        const stats = getMiniLeagueStats(row.team.id, subsetIds, fixtures);
        return `${stats.points}|${stats.goalDifference}|${stats.goalsFor}`;
      }
    );

    for (const miniGroup of step2MiniGroups) {
      if (miniGroup.length === 1) {
        ranked.push(miniGroup[0]);
        continue;
      }

      const overallGroups = groupByEqualValue(
        sortByOverallRecord(miniGroup),
        (row) => `${row.goalDifference}|${row.goalsFor}`
      );

      for (const overallGroup of overallGroups) {
        if (overallGroup.length === 1) {
          ranked.push(overallGroup[0]);
          continue;
        }

        const conductGroups = groupByEqualValue(
          sortByConduct(overallGroup, fixtures),
          (row) => computeConductScore(row.team.id, fixtures)
        );

        for (const conductGroup of conductGroups) {
          if (conductGroup.length === 1) {
            ranked.push(conductGroup[0]);
            continue;
          }

          ranked.push(...[...conductGroup].sort(compareByFifaRanking));
        }
      }
    }
  }

  return ranked;
}

function sortStandings(standings, fixtures) {
  const pointGroups = groupByEqualValue(
    [...standings].sort((a, b) => b.points - a.points),
    (row) => row.points
  );

  return pointGroups.flatMap((group) => {
    if (group.length === 1) {
      return group;
    }
    return rankTiedTeams(group, fixtures);
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

  return sortStandings(standings, groupFixtures);
}
