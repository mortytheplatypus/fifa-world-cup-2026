const { getKnockoutResult } = require('../lib/handlers');

const MATCH_ID_PATTERN = /^M\d{2,3}$/;

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { matchId } = req.query;

  if (!matchId || !MATCH_ID_PATTERN.test(matchId)) {
    return res.status(400).json({ error: 'Invalid match id' });
  }

  try {
    const result = await getKnockoutResult(matchId);

    if (!result) {
      return res.status(404).json({ error: 'Knockout result not found' });
    }

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
