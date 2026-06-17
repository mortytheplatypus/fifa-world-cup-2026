const { resolveFixtureId } = require('./idMap');
const { isKickoffDelayElapsed } = require('./fixtures');
const { parseMatchGoals } = require('./parseScorers');

function transformGame(game, { now = new Date(), usaDayFixtureIds = null } = {}) {
  if (game.type !== 'group') {
    return { skip: 'not_group' };
  }

  if (game.finished !== 'TRUE') {
    return { skip: 'unfinished' };
  }

  const fixtureId = resolveFixtureId(game.id);
  if (!fixtureId) {
    return { skip: 'unmapped' };
  }

  if (usaDayFixtureIds && !usaDayFixtureIds.has(fixtureId)) {
    return { skip: 'wrong_day' };
  }

  if (!isKickoffDelayElapsed(fixtureId, now)) {
    return { skip: 'too_early', fixtureId };
  }

  const homeScore = Number(game.home_score);
  const awayScore = Number(game.away_score);
  const goals = parseMatchGoals(game.home_scorers, game.away_scorers);

  const result = {
    homeScore,
    awayScore,
    ...(goals.length ? { goals } : {}),
  };

  return { fixtureId, result };
}

function transformGames(games, options = {}) {
  const { usaDayFixtureIds = null } = options;
  const matches = {};
  const skipped = {
    not_group: 0,
    unfinished: 0,
    unmapped: 0,
    too_early: 0,
    wrong_day: 0,
  };
  const synced = [];

  for (const game of games) {
    const outcome = transformGame(game, options);

    if (outcome.skip) {
      skipped[outcome.skip] += 1;
      continue;
    }

    matches[outcome.fixtureId] = outcome.result;
    synced.push(outcome.fixtureId);
  }

  return { matches, skipped, synced };
}

module.exports = { transformGame, transformGames };
