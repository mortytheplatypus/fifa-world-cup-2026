/**
 * Seed knockout match times and venues from official FIFA schedule data.
 *
 * Updates public/data/knockouts.json and syncs schedule fields to MongoDB
 * (time, venue, city, date) without overwriting scores.
 *
 * Usage:
 *   node scripts/seed-knockout-schedule.js
 *   node scripts/seed-knockout-schedule.js --dry-run
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { buildKnockoutScheduleFields } = require('./knockout-schedule-data');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const KNOCKOUTS_PATH = path.join(DATA_DIR, 'knockouts.json');

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

function applyScheduleToDocument(doc) {
  const schedule = buildKnockoutScheduleFields(doc._id);
  return {
    ...doc,
    date: schedule.date,
    time: schedule.time,
    venue: schedule.venue,
    city: schedule.city,
  };
}

async function syncToMongo(knockouts) {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log('MONGODB_URI not set — skipped MongoDB sync (JSON file still updated).');
    return;
  }

  const dbName = process.env.MONGODB_DB_NAME || 'fifa-world-cup-2026';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const collection = client.db(dbName).collection('knockouts');
    let updated = 0;

    for (const doc of knockouts) {
      const result = await collection.updateOne(
        { _id: doc._id },
        {
          $set: {
            date: doc.date,
            time: doc.time,
            venue: doc.venue,
            city: doc.city,
          },
        },
        { upsert: true }
      );

      if (result.matchedCount > 0 || result.upsertedCount > 0) {
        updated += 1;
      }
    }

    console.log(`MongoDB: updated schedule fields on ${updated} knockout documents.`);
  } finally {
    await client.close();
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  loadEnv();

  if (!fs.existsSync(KNOCKOUTS_PATH)) {
    throw new Error(`Missing ${KNOCKOUTS_PATH}`);
  }

  const knockouts = JSON.parse(fs.readFileSync(KNOCKOUTS_PATH, 'utf8'));
  const updated = knockouts.map(applyScheduleToDocument);

  console.log('Knockout schedule (local venue time):');
  for (const doc of updated) {
    console.log(
      `  ${doc._id} ${doc.tag}  ${doc.date} ${doc.time}  ${doc.venue}, ${doc.city}`
    );
  }

  if (dryRun) {
    console.log('\nDry run — no files or database changed.');
    return;
  }

  fs.writeFileSync(KNOCKOUTS_PATH, `${JSON.stringify(updated, null, 2)}\n`);
  console.log(`\nWrote ${KNOCKOUTS_PATH}`);

  await syncToMongo(updated);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
