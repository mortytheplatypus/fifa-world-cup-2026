const fs = require('fs');
const path = require('path');

const RESULTS_PATH = path.join(__dirname, '..', '..', '..', 'public', 'data', 'results.json');

function readResultsJson() {
  if (!fs.existsSync(RESULTS_PATH)) {
    return { lastUpdated: null, matches: {} };
  }

  return JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8'));
}

function mergeResults(existing, incoming) {
  return {
    ...existing,
    matches: {
      ...(existing.matches ?? {}),
      ...incoming,
    },
  };
}

function writeResultsJson(data, updatedAt) {
  const payload = {
    lastUpdated: updatedAt.toISOString(),
    matches: data.matches,
  };

  fs.writeFileSync(RESULTS_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return payload;
}

async function upsertMongoResults(matches, updatedAt) {
  const { MongoClient } = require('mongodb');
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  const dbName = process.env.MONGODB_DB_NAME || 'fifa-world-cup-2026';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const collection = client.db(dbName).collection('results');
    let count = 0;

    for (const [id, result] of Object.entries(matches)) {
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
  } finally {
    await client.close();
  }
}

async function persistResults(incomingMatches, { dryRun = false } = {}) {
  const updatedAt = new Date();
  const existing = readResultsJson();
  const merged = mergeResults(existing, incomingMatches);

  if (dryRun) {
    return {
      dryRun: true,
      synced: Object.keys(incomingMatches).length,
      lastUpdated: updatedAt.toISOString(),
      matches: incomingMatches,
    };
  }

  const written = writeResultsJson(merged, updatedAt);
  const mongoCount = await upsertMongoResults(incomingMatches, updatedAt);

  return {
    synced: mongoCount,
    lastUpdated: written.lastUpdated,
    fixtureIds: Object.keys(incomingMatches),
  };
}

module.exports = {
  readResultsJson,
  mergeResults,
  writeResultsJson,
  upsertMongoResults,
  persistResults,
};
