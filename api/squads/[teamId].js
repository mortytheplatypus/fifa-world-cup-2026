const { getSquad } = require('../lib/handlers');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { teamId } = req.query;
    const squad = await getSquad(teamId.toUpperCase());

    if (!squad) {
      return res.status(404).json({ error: 'Squad not found' });
    }

    res.status(200).json(squad);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
