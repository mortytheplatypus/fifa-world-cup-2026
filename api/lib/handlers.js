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

async function getTeamById(teamId) {
  const db = await getDb();
  const team = await db.collection('teams').findOne({ _id: teamId });

  if (!team) {
    return null;
  }

  return mapTeamDoc(team);
}

async function getTeamByFlagCode(flagCode) {
  const db = await getDb();
  const team = await db
    .collection('teams')
    .findOne({ flagCode: flagCode.toLowerCase() });

  if (!team) {
    return null;
  }

  return mapTeamDoc(team);
}

async function getSquad(teamId) {
  const db = await getDb();
  const squad = await db.collection('squads').findOne({ _id: teamId });

  if (!squad) {
    return null;
  }

  const { _id, coach, captain, playerIds } = squad;
  return { teamId: _id, coach, captain, playerIds };
}

async function getPlayer(playerId) {
  const db = await getDb();
  const player = await db.collection('players').findOne({ _id: playerId });

  if (!player) {
    return null;
  }

  const { _id, ...rest } = player;
  return { id: _id, ...rest };
}

async function getWcHistory(teamId) {
  const db = await getDb();
  const history = await db.collection('wcHistory').findOne({ _id: teamId });

  if (!history) {
    return null;
  }

  const { _id, championships, bestFinish, appearances, tournaments } = history;
  return { teamId: _id, championships, bestFinish, appearances, tournaments };
}

module.exports = {
  getTeams,
  getFixtures,
  getResults,
  getTeamById,
  getTeamByFlagCode,
  getSquad,
  getPlayer,
  getWcHistory,
};
