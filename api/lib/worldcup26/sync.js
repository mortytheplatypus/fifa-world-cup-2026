const { fetchGames } = require('./fetch');
const { transformGames } = require('./transform');
const { persistResults } = require('./persist');

async function syncResultsFromWorldCup26(options = {}) {
  const { dryRun = false, now = new Date() } = options;

  const games = await fetchGames();
  const { matches, skipped, synced } = transformGames(games, { now });

  const persistOutcome = await persistResults(matches, { dryRun });

  return {
    ...persistOutcome,
    skipped,
    syncedFixtureIds: synced,
  };
}

module.exports = { syncResultsFromWorldCup26 };
