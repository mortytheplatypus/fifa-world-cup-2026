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

const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv, COLLECTIONS, seedCollection } = require('./lib/mongodb-seed');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

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
  wcHistory  <- wc-history.json
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
