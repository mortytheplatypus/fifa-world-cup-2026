const { MongoClient } = require('mongodb');

let client;
let db;

async function getDb() {
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set');
  }

  const dbName = process.env.MONGODB_DB_NAME || 'fifa-world-cup-2026';

  client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);

  return db;
}

module.exports = { getDb };
