const { getDb } = require('./db');

async function getTeams() {
  const db = await getDb();
  const teams = await db
    .collection('teams')
    .find({})
    .sort({ group: 1, name: 1 })
    .toArray();

  return teams.map(({ _id, name, group, flagCode, colors, fifaRankingPreWc }) => ({
    id: _id,
    name,
    group,
    flagCode,
    ...(colors?.length ? { colors } : {}),
    ...(fifaRankingPreWc != null ? { fifaRankingPreWc } : {}),
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

function formatKnockoutDocument(doc) {
  const {
    _id,
    updatedAt,
    date,
    time,
    venue,
    city,
    round,
    tag,
    homeScore,
    awayScore,
    goals,
    cards,
  } = doc;

  return {
    id: _id,
    date: date ?? null,
    time: time ?? null,
    venue: venue ?? null,
    city: city ?? null,
    round: round ?? null,
    tag: tag ?? null,
    homeScore: homeScore ?? null,
    awayScore: awayScore ?? null,
    ...(goals?.length ? { goals } : {}),
    ...(cards?.length ? { cards } : {}),
    ...(updatedAt ? { lastUpdated: new Date(updatedAt).toISOString() } : {}),
  };
}

async function getKnockoutResult(matchId) {
  const db = await getDb();
  const result = await db.collection('knockouts').findOne({ _id: matchId });

  if (!result) {
    return null;
  }

  return formatKnockoutDocument(result);
}

async function getKnockoutResults() {
  const db = await getDb();
  const results = await db
    .collection('knockouts')
    .find({})
    .sort({ _id: 1 })
    .toArray();

  const matches = {};
  let lastUpdated = null;

  for (const result of results) {
    const formatted = formatKnockoutDocument(result);
    matches[formatted.id] = formatted;

    const updatedAt = result.updatedAt;
    if (updatedAt && (!lastUpdated || updatedAt > lastUpdated)) {
      lastUpdated = updatedAt;
    }
  }

  return {
    lastUpdated: lastUpdated ? new Date(lastUpdated).toISOString() : null,
    matches,
  };
}

module.exports = {
  getTeams,
  getFixtures,
  getResults,
  getKnockoutResult,
  getKnockoutResults,
};
