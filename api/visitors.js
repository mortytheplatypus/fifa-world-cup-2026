const { getDb } = require('./lib/db');

const COUNTER_ID = 'visitor_count';
const COLLECTION = 'site_stats';

async function getTotal() {
  const db = await getDb();
  const doc = await db.collection(COLLECTION).findOne({ _id: COUNTER_ID });
  return doc?.total ?? 0;
}

async function incrementTotal() {
  const db = await getDb();
  const result = await db.collection(COLLECTION).findOneAndUpdate(
    { _id: COUNTER_ID },
    { $inc: { total: 1 } },
    { upsert: true, returnDocument: 'after' }
  );
  return result?.total ?? 1;
}

module.exports = async (req, res) => {
  if (req.method === 'GET') {
    try {
      res.status(200).json({ total: await getTotal() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  if (req.method === 'POST') {
    try {
      res.status(200).json({ total: await incrementTotal() });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
    return;
  }

  res.status(405).json({ error: 'Method not allowed' });
};
