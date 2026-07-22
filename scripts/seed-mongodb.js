#!/usr/bin/env node
/**
 * Seed MongoDB from JSON files in public/data/.
 *
 * Usage:
 *   npm run seed:db
 *   node scripts/seed-mongodb.js
 *   node scripts/seed-mongodb.js --only teams,players
 *   node scripts/seed-mongodb.js --dry-run
 *
 * Requires in .env:
 *   MONGODB_URI=mongodb+srv://...
 *   MONGODB_DB_NAME=fifa-world-cup-2026   (optional)
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

function flattenPlayers(playersData) {
  const root = playersData.players ?? playersData;
  const first = Object.values(root ?? {})[0];
  const nestedByTeam = Boolean(first && typeof first === 'object' && !first.id);

  if (!nestedByTeam) {
    return root;
  }

  const flat = {};
  for (const teamPlayers of Object.values(root)) {
    for (const [playerId, player] of Object.entries(teamPlayers ?? {})) {
      flat[playerId] = player;
    }
  }
  return flat;
}

const COLLECTIONS = {
  teams: {
    file: 'teams.json',
    collection: 'teams',
    build: (data) => buildTeamDocs(data),
    transform: (data) => data,
  },
  fixtures: {
    file: 'fixtures.json',
    collection: 'fixtures',
    build: (data) => buildFixtureDocs(data),
    transform: (data) => data,
  },
  results: {
    file: 'results.json',
    collection: 'results',
    build: (data) => buildResultDocs(data),
    transform: (data) => data,
  },
  squads: {
    file: 'squads.json',
    collection: 'squads',
    build: (data) => buildSquadDocs(data),
    transform: (data) => data,
  },
  players: {
    file: 'players.json',
    collection: 'players',
    build: (data) => buildPlayerDocs(data),
    transform: (data) => data,
  },
  wcHistory: {
    file: 'wcHistory.json',
    collection: 'wcHistory',
    build: (data) => buildWcHistoryDocs(data),
    transform: (data) => data,
  },
};

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

function readJson(dataDir, filename) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, filename), 'utf8'));
}

function chunk(array, size) {
  const chunks = [];
  for (let index = 0; index < array.length; index += size) {
    chunks.push(array.slice(index, index + size));
  }
  return chunks;
}

async function bulkUpsert(collection, operations, batchSize = 500) {
  if (!operations.length) {
    return 0;
  }

  let count = 0;

  for (const batch of chunk(operations, batchSize)) {
    const result = await collection.bulkWrite(batch, { ordered: false });
    count += result.upsertedCount + result.modifiedCount + result.matchedCount;
  }

  return count;
}

function buildTeamDocs(teams) {
  return teams.map((team) => {
    const { id, name, group, flagCode, colors, fifaRankingPreWc, confederation, founded, homeStadium } = team;

    return {
      replaceOne: {
        filter: { _id: id },
        replacement: {
          _id: id,
          name,
          group,
          flagCode,
          ...(colors?.length ? { colors } : {}),
          ...(fifaRankingPreWc != null ? { fifaRankingPreWc } : {}),
          ...(confederation ? { confederation } : {}),
          ...(founded != null ? { founded } : {}),
          ...(homeStadium ? { homeStadium } : {}),
        },
        upsert: true,
      },
    };
  });
}

function buildFixtureDocs(fixturesByGroup) {
  const operations = [];

  for (const [group, fixtures] of Object.entries(fixturesByGroup)) {
    for (const fixture of fixtures) {
      const { id, matchday, homeTeam, awayTeam, date, time, venue, city } = fixture;

      operations.push({
        replaceOne: {
          filter: { _id: id },
          replacement: {
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
          upsert: true,
        },
      });
    }
  }

  return operations;
}

function buildResultDocs(data) {
  const updatedAt = data.lastUpdated ? new Date(data.lastUpdated) : new Date();

  return Object.entries(data.matches ?? {}).map(([id, result]) => {
    const { homeScore, awayScore, goals, cards } = result;

    return {
      replaceOne: {
        filter: { _id: id },
        replacement: {
          _id: id,
          homeScore,
          awayScore,
          ...(goals?.length ? { goals } : {}),
          ...(cards?.length ? { cards } : {}),
          updatedAt,
        },
        upsert: true,
      },
    };
  });
}

function buildSquadDocs(data) {
  return Object.entries(data.squads ?? {}).map(([teamId, squad]) => {
    const { coach, captain, playerIds } = squad;

    return {
      replaceOne: {
        filter: { _id: teamId },
        replacement: { _id: teamId, coach, captain, playerIds },
        upsert: true,
      },
    };
  });
}

function buildPlayerDocs(data) {
  const flatPlayers = flattenPlayers(data);

  return Object.entries(flatPlayers).map(([id, player]) => {
    const {
      teamId,
      flagCode,
      name,
      position,
      shirtNumber,
      club,
      imageUrl,
    } = player;

    return {
      replaceOne: {
        filter: { _id: id },
        replacement: {
          _id: id,
          teamId,
          flagCode,
          name,
          position,
          ...(shirtNumber != null ? { shirtNumber } : {}),
          ...(club ? { club } : {}),
          ...(imageUrl ? { imageUrl } : {}),
        },
        upsert: true,
      },
    };
  });
}

function buildWcHistoryDocs(data) {
  return Object.entries(data.teams ?? {}).map(([teamId, history]) => {
    const { championships, bestFinish, appearances, tournaments } = history;

    return {
      replaceOne: {
        filter: { _id: teamId },
        replacement: { _id: teamId, championships, bestFinish, appearances, tournaments },
        upsert: true,
      },
    };
  });
}

async function seedCollection(db, key, dataDir) {
  const config = COLLECTIONS[key];
  const raw = readJson(dataDir, config.file);
  const data = config.transform(raw);
  const operations = config.build(data);
  const collection = db.collection(config.collection);
  await bulkUpsert(collection, operations);

  return {
    key,
    collection: config.collection,
    file: config.file,
    documents: operations.length,
  };
}

function parseArgs(argv) {
  const options = {
    only: null,
    dryRun: false,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    if (arg === '--only') {
      const value = argv[index + 1];
      if (!value) {
        throw new Error('--only requires a comma-separated list, e.g. teams,players');
      }
      options.only = value.split(',').map((entry) => entry.trim());
      index += 1;
      continue;
    }

    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function printHelp() {
  console.log(`Seed MongoDB from public/data JSON files.

Usage:
  npm run seed:db
  node scripts/seed-mongodb.js [--only teams,fixtures,results,squads,players,wcHistory] [--dry-run]

Environment:
  MONGODB_URI        MongoDB connection string (required)
  MONGODB_DB_NAME    Database name (default: fifa-world-cup-2026)

Collections:
  teams      <- teams.json
  fixtures   <- fixtures.json
  results    <- results.json
  squads     <- squads.json
  players    <- players.json
  wcHistory  <- wcHistory.json
`);
}

function resolveCollections(only) {
  const keys = Object.keys(COLLECTIONS);

  if (!only) {
    return keys;
  }

  const invalid = only.filter((key) => !keys.includes(key));
  if (invalid.length) {
    throw new Error(`Unknown collection(s): ${invalid.join(', ')}`);
  }

  return only;
}

async function main() {
  loadEnv();

  const options = parseArgs(process.argv);
  const selected = resolveCollections(options.only);

  if (options.dryRun) {
    const dbName = process.env.MONGODB_DB_NAME || 'fifa-world-cup-2026';
    console.log(`Dry run — would seed ${dbName}:`);
    for (const key of selected) {
      const config = COLLECTIONS[key];
      console.log(`  ${config.collection} <- public/data/${config.file}`);
    }
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it to .env before seeding.');
  }

  const dbName = process.env.MONGODB_DB_NAME || 'fifa-world-cup-2026';

  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    console.log(`Seeding database "${dbName}" from ${DATA_DIR}\n`);

    for (const key of selected) {
      const result = await seedCollection(db, key, DATA_DIR);
      console.log(
        `  ${result.collection.padEnd(10)} ${String(result.documents).padStart(5)} docs from ${result.file}`
      );
    }

    console.log('\nSeed complete.');
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
