const USA_TIMEZONE = 'America/New_York';
const META_ID = 'worldcup26';

async function withMetaCollection(fn) {
  const { MongoClient } = require('mongodb');
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  const dbName = process.env.MONGODB_DB_NAME || 'fifa-world-cup-2026';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    return await fn(client.db(dbName).collection('sync_meta'));
  } finally {
    await client.close();
  }
}

async function getSyncMeta() {
  return withMetaCollection((collection) => collection.findOne({ _id: META_ID }));
}

async function recordCronSync({
  matchDay,
  runDateEt,
  advanceMatchDay = false,
  now = new Date(),
}) {
  const existing = await getSyncMeta();
  const doc = {
    _id: META_ID,
    lastCronRunDateEt: runDateEt,
    lastSyncAt: now,
    lastMatchDaySynced: existing?.lastMatchDaySynced ?? null,
  };

  if (advanceMatchDay && matchDay) {
    doc.lastMatchDaySynced = matchDay;
  }

  return withMetaCollection((collection) =>
    collection.replaceOne({ _id: META_ID }, doc, { upsert: true })
  );
}

module.exports = {
  USA_TIMEZONE,
  META_ID,
  getSyncMeta,
  recordCronSync,
};
