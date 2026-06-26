const { getWcHistories } = require('../server/lib/handlers');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    res.status(200).json(await getWcHistories());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
