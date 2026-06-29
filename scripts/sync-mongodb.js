const { MongoClient } = require('mongodb');
const path = require('path');
const { loadEnv, COLLECTIONS, seedCollection } = require('./lib/mongodb-seed');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

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

    const results = await Promise.all(
      Object.keys(COLLECTIONS).map((key) => seedCollection(db, key, DATA_DIR))
    );

    for (const result of results) {
      console.log(`Synced ${result.documents} ${result.collection} from ${result.file}`);
    }
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
