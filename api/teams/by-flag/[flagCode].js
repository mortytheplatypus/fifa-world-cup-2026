const { getTeamByFlagCode } = require('../../lib/handlers');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { flagCode } = req.query;
    const team = await getTeamByFlagCode(flagCode);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.status(200).json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
