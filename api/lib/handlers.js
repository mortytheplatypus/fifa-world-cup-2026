const { getDb } = require('./db');



async function getTeams() {
  const db = await getDb();
  const teams = await db
    .collection('teams')
    .find({})
    .sort({ group: 1, name: 1 })
    .toArray();

  return teams.map(({ _id, name, group, flagCode, colors }) => ({
    id: _id,
    name,
    group,
    flagCode,
    ...(colors?.length ? { colors } : {}),
  }));
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
    const { _id, updatedAt, homeScore, awayScore, goals } = result;
    matches[_id] = {
      homeScore,
      awayScore,
      ...(goals?.length ? { goals } : {}),
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

module.exports = { getTeams, getFixtures, getResults };
