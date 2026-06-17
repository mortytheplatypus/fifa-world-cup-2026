const { fetchGames } = require('./fetch');
const { transformGames } = require('./transform');
const { persistResults } = require('./persist');
const {
  getFixtureIdsForUsaDay,
  getNextUsaMatchDayToSync,
  getUsaDateKey,
  USA_TIMEZONE,
} = require('./fixtures');
const { getSyncMeta, recordCronSync } = require('./syncMeta');

async function syncResultsFromWorldCup26(options = {}) {
  const { dryRun = false, now = new Date(), mode = 'manual' } = options;

  const games = await fetchGames();
  const transformOptions = { now };

  if (mode === 'cron') {
    const meta = dryRun ? null : await getSyncMeta();
    const todayEt = getUsaDateKey(now, USA_TIMEZONE);

    if (!dryRun && meta?.lastCronRunDateEt === todayEt) {
      return {
        skipped: { cron: 'already_ran_today' },
        synced: 0,
        syncedFixtureIds: [],
        cronSkipped: true,
        reason: 'already_ran_today',
        lastCronRunDateEt: meta.lastCronRunDateEt,
      };
    }

    const matchDay = getNextUsaMatchDayToSync(now, meta?.lastMatchDaySynced ?? null);

    if (!matchDay) {
      return {
        skipped: { cron: 'not_due' },
        synced: 0,
        syncedFixtureIds: [],
        cronSkipped: true,
        reason: 'not_due',
        todayEt,
      };
    }

    const fixtureIds = getFixtureIdsForUsaDay(matchDay);
    transformOptions.usaDayFixtureIds = new Set(fixtureIds);

    const { matches, skipped, synced } = transformGames(games, transformOptions);
    const persistOutcome = await persistResults(matches, { dryRun });

    if (!dryRun) {
      await recordCronSync({
        matchDay,
        runDateEt: todayEt,
        advanceMatchDay: synced.length > 0,
        now,
      });
    }

    return {
      ...persistOutcome,
      skipped,
      syncedFixtureIds: synced,
      matchDay,
      todayEt,
      cronSkipped: false,
    };
  }

  const { matches, skipped, synced } = transformGames(games, transformOptions);
  const persistOutcome = await persistResults(matches, { dryRun });

  return {
    ...persistOutcome,
    skipped,
    syncedFixtureIds: synced,
  };
}

module.exports = { syncResultsFromWorldCup26 };
