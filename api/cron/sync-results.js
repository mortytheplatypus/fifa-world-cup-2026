const { syncResultsFromWorldCup26 } = require('../lib/worldcup26/sync');
const { getDailyCronUtcHour } = require('../lib/worldcup26/fixtures');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return res.status(500).json({ error: 'CRON_SECRET is not set' });
  }

  const authHeader = req.headers.authorization ?? '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

  if (token !== cronSecret) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const outcome = await syncResultsFromWorldCup26({ dryRun: false, mode: 'cron' });

    if (outcome.cronSkipped) {
      return res.status(200).json({
        skipped: true,
        reason: outcome.reason,
        lastCronRunDateEt: outcome.lastCronRunDateEt,
        todayEt: outcome.todayEt,
        schedule: `0 ${getDailyCronUtcHour()} * * * UTC`,
      });
    }

    res.status(200).json({
      synced: outcome.synced,
      skipped: outcome.skipped,
      lastUpdated: outcome.lastUpdated,
      fixtureIds: outcome.fixtureIds ?? [],
      matchDay: outcome.matchDay,
      todayEt: outcome.todayEt,
      schedule: `0 ${getDailyCronUtcHour()} * * * UTC`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
