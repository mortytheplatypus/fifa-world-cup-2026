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
    const { id, name, group, flagCode, colors } = team;

    await collection.replaceOne(
      { _id: id },
      {
        _id: id,
        name,
        group,
        flagCode,
        ...(colors?.length ? { colors } : {}),
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
    const { homeScore, awayScore, goals } = result;

    await collection.replaceOne(
      { _id: id },
      {
        _id: id,
        homeScore,
        awayScore,
        ...(goals?.length ? { goals } : {}),
        updatedAt,
      },
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

    const [teams, fixtures, results] = await Promise.all([
      syncTeams(db.collection('teams')),
      syncFixtures(db.collection('fixtures')),
      syncResults(db.collection('results')),
    ]);

    console.log(`Synced ${teams} teams from teams.json`);
    console.log(`Synced ${fixtures} fixtures from fixtures.json`);
    console.log(`Synced ${results} results from results.json`);
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
