const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separator = trimmed.indexOf('=');
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function readJson(filename) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), 'utf8'));
}

async function syncTeams(collection) {
  const teams = readJson('teams.json');
  let count = 0;

  for (const team of teams) {
    const { id, name, group, flagCode, colors, fifaRankingPreWc } = team;

    await collection.replaceOne(
      { _id: id },
      {
        _id: id,
        name,
        group,
        flagCode,
        ...(colors?.length ? { colors } : {}),
        ...(fifaRankingPreWc != null ? { fifaRankingPreWc } : {}),
      },
      { upsert: true }
    );
    count += 1;
  }

  return count;
}

async function syncFixtures(collection) {
  const fixturesByGroup = readJson('fixtures.json');
  let count = 0;

  for (const [group, fixtures] of Object.entries(fixturesByGroup)) {
    for (const fixture of fixtures) {
      const { id, matchday, homeTeam, awayTeam, date, time, venue, city } =
        fixture;

      await collection.replaceOne(
        { _id: id },
        {
          _id: id,
          group,
          matchday,
          homeTeam,
          awayTeam,
          date,
          time,
          venue,
          city,
        },
        { upsert: true }
      );
      count += 1;
    }
  }

  return count;
}

async function syncResults(collection) {
  const data = readJson('results.json');
  const updatedAt = data.lastUpdated ? new Date(data.lastUpdated) : new Date();
  let count = 0;

  for (const [id, result] of Object.entries(data.matches ?? {})) {
    const { homeScore, awayScore, goals, cards } = result;

    await collection.replaceOne(
      { _id: id },
      {
        _id: id,
        homeScore,
        awayScore,
        ...(goals?.length ? { goals } : {}),
        ...(cards?.length ? { cards } : {}),
        updatedAt,
      },
      { upsert: true }
    );
    count += 1;
  }

  return count;
}

async function syncSquads(collection) {
  const data = readJson('squads.json');
  let count = 0;

  for (const [teamId, squad] of Object.entries(data.squads ?? {})) {
    const { coach, captain, playerIds } = squad;

    await collection.replaceOne(
      { _id: teamId },
      { _id: teamId, coach, captain, playerIds },
      { upsert: true }
    );
    count += 1;
  }

  return count;
}

async function syncPlayers(collection) {
  const data = readJson('players.json');
  let count = 0;

  for (const [id, player] of Object.entries(data.players ?? {})) {
    const { teamId, flagCode, name, position, shirtNumber, club, dateOfBirth, age, heightCm, foot, caps, internationalGoals, wcAppearances, wcGoals, worldCups } = player;

    await collection.replaceOne(
      { _id: id },
      {
        _id: id,
        teamId,
        flagCode,
        name,
        position,
        ...(shirtNumber != null ? { shirtNumber } : {}),
        ...(club ? { club } : {}),
        ...(dateOfBirth ? { dateOfBirth } : {}),
        ...(age != null ? { age } : {}),
        ...(heightCm != null ? { heightCm } : {}),
        ...(foot ? { foot } : {}),
        ...(caps != null ? { caps } : {}),
        ...(internationalGoals != null ? { internationalGoals } : {}),
        ...(wcAppearances != null ? { wcAppearances } : {}),
        ...(wcGoals != null ? { wcGoals } : {}),
        ...(worldCups?.length ? { worldCups } : {}),
      },
      { upsert: true }
    );
    count += 1;
  }

  return count;
}

async function syncWcHistory(collection) {
  const data = readJson('wc-history.json');
  let count = 0;

  for (const [teamId, history] of Object.entries(data.teams ?? {})) {
    const { championships, bestFinish, appearances, tournaments } = history;

    await collection.replaceOne(
      { _id: teamId },
      { _id: teamId, championships, bestFinish, appearances, tournaments },
      { upsert: true }
    );
    count += 1;
  }

  return count;
}

async function main() {
  loadEnv();

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  const dbName = process.env.MONGODB_DB_NAME || 'fifa-world-cup-2026';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    const [teams, fixtures, results, squads, players, wcHistory] = await Promise.all([
      syncTeams(db.collection('teams')),
      syncFixtures(db.collection('fixtures')),
      syncResults(db.collection('results')),
      syncSquads(db.collection('squads')),
      syncPlayers(db.collection('players')),
      syncWcHistory(db.collection('wcHistory')),
    ]);

    console.log(`Synced ${teams} teams from teams.json`);
    console.log(`Synced ${fixtures} fixtures from fixtures.json`);
    console.log(`Synced ${results} results from results.json`);
    console.log(`Synced ${squads} squads from squads.json`);
    console.log(`Synced ${players} players from players.json`);
    console.log(`Synced ${wcHistory} WC history records from wc-history.json`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
