const { getWcHistory } = require('../lib/handlers');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { teamId } = req.query;
    const history = await getWcHistory(teamId.toUpperCase());

    if (!history) {
      return res.status(404).json({ error: 'WC history not found' });
    }

    res.status(200).json(history);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
