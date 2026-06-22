const { getPlayer } = require('../lib/handlers');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { playerId } = req.query;
    const player = await getPlayer(playerId);

    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    res.status(200).json(player);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
