const { getDb } = require('./db');

async function getTeams() {
  const db = await getDb();
  const teams = await db
    .collection('teams')
    .find({})
    .sort({ group: 1, name: 1 })
    .toArray();

  return teams.map(mapTeamDoc);
}

async function getFixtures() {
  const db = await getDb();
  const fixtures = await db
    .collection('fixtures')
    .find({})
    .sort({ group: 1, matchday: 1, _id: 1 })
    .toArray();

  const fixturesByGroup = {};

  for (const fixture of fixtures) {
    const { _id, group, ...rest } = fixture;
    if (!fixturesByGroup[group]) {
      fixturesByGroup[group] = [];
    }
    fixturesByGroup[group].push({ id: _id, ...rest });
  }

  return fixturesByGroup;
}

async function getResults() {
  const db = await getDb();
  const results = await db.collection('results').find({}).toArray();

  const matches = {};
  let lastUpdated = null;

  for (const result of results) {
    const { _id, updatedAt, homeScore, awayScore, goals, cards } = result;
    matches[_id] = {
      homeScore,
      awayScore,
      ...(goals?.length ? { goals } : {}),
      ...(cards?.length ? { cards } : {}),
    };

    if (updatedAt && (!lastUpdated || updatedAt > lastUpdated)) {
      lastUpdated = updatedAt;
    }
  }

  return {
    lastUpdated: lastUpdated ? new Date(lastUpdated).toISOString() : null,
    matches,
  };
}

function mapTeamDoc({ _id, name, group, flagCode, colors, fifaRankingPreWc, confederation, founded, homeStadium }) {
  return {
    id: _id,
    name,
    group,
    flagCode,
    ...(colors?.length ? { colors } : {}),
    ...(fifaRankingPreWc != null ? { fifaRankingPreWc } : {}),
    ...(confederation ? { confederation } : {}),
    ...(founded != null ? { founded } : {}),
    ...(homeStadium ? { homeStadium } : {}),
  };
}

async function getSquads() {
  const db = await getDb();
  const squads = await db.collection('squads').find({}).toArray();

  return {
    lastUpdated: null,
    squads: Object.fromEntries(
      squads.map(({ _id, coach, captain, playerIds }) => [
        _id,
        { coach, captain, playerIds },
      ])
    ),
  };
}

async function getPlayers() {
  const db = await getDb();
  const players = await db.collection('players').find({}).toArray();

  return {
    lastUpdated: null,
    players: Object.fromEntries(
      players.map(({ _id, ...rest }) => [_id, { id: _id, ...rest }])
    ),
  };
}

async function getWcHistories() {
  const db = await getDb();
  const histories = await db.collection('wcHistory').find({}).toArray();

  return {
    lastUpdated: null,
    wcHistory: Object.fromEntries(
      histories.map(({ _id, championships, bestFinish, appearances, tournaments }) => [
        _id,
        { championships, bestFinish, appearances, tournaments },
      ])
    ),
  };
}

module.exports = {
  getTeams,
  getFixtures,
  getResults,
  getSquads,
  getPlayers,
  getWcHistories,
};
