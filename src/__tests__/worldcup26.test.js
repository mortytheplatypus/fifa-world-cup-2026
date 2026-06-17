const {
  parseScorers,
  parseMatchGoals,
  normalizeScorersString,
} = require('../../api/lib/worldcup26/parseScorers');
const { resolveFixtureId } = require('../../api/lib/worldcup26/idMap');
const { transformGame } = require('../../api/lib/worldcup26/transform');
const {
  getUsaMatchDaysSorted,
  isUsaDaySyncDue,
  getNextUsaMatchDayToSync,
  getFixtureIdsForUsaDay,
  getDailyCronUtcHour,
} = require('../../api/lib/worldcup26/fixtures');

describe('parseScorers', () => {
  test('parses normal home scorers', () => {
    const goals = parseScorers('{"J. Quiñones 9\'","R. Jiménez 67\'"}', 'home');

    expect(goals).toEqual([
      { minute: 9, scorer: 'J. Quiñones', team: 'home' },
      { minute: 67, scorer: 'R. Jiménez', team: 'home' },
    ]);
  });

  test('handles curly quotes and null', () => {
    expect(normalizeScorersString('null')).toEqual([]);
    expect(
      normalizeScorersString('{“J. Quiñones 9\'”,”R. Jiménez 67\'”}')
    ).toEqual(["J. Quiñones 9'", "R. Jiménez 67'"]);
  });

  test('parses stoppage time, own goals, and penalties', () => {
    const goals = parseMatchGoals(
      '{"D. Bobadilla 7\'(OG)","F. Balogun 45\'+5\'"}',
      '{"Breel Embolo 17\' (p)"}'
    );

    expect(goals).toEqual([
      { minute: 7, scorer: '(OG) D. Bobadilla', team: 'home' },
      { minute: 17, scorer: 'Breel Embolo (P)', team: 'away' },
      { minute: '45+5', scorer: 'F. Balogun', team: 'home' },
    ]);
  });
});

describe('idMap', () => {
  test('resolves known worldcup26 ids', () => {
    expect(resolveFixtureId('1')).toBe('A-1');
    expect(resolveFixtureId('5')).toBe('C-2');
    expect(resolveFixtureId('8')).toBe('B-2');
  });

  test('returns null for knockout ids', () => {
    expect(resolveFixtureId('73')).toBeNull();
    expect(resolveFixtureId('104')).toBeNull();
  });
});

describe('transformGame', () => {
  test('skips unfinished and unmapped games', () => {
    expect(
      transformGame({ id: '9', type: 'group', finished: 'FALSE' }).skip
    ).toBe('unfinished');

    expect(
      transformGame({ id: '73', type: 'r32', finished: 'TRUE' }).skip
    ).toBe('not_group');

    expect(
      transformGame({ id: '73', type: 'group', finished: 'TRUE' }).skip
    ).toBe('unmapped');
  });

  test('transforms a finished group game', () => {
    const outcome = transformGame({
      id: '1',
      type: 'group',
      finished: 'TRUE',
      home_score: '2',
      away_score: '0',
      home_scorers: '{"J. Quiñones 9\'","R. Jiménez 67\'"}',
      away_scorers: 'null',
    });

    expect(outcome.fixtureId).toBe('A-1');
    expect(outcome.result.homeScore).toBe(2);
    expect(outcome.result.awayScore).toBe(0);
    expect(outcome.result.goals).toHaveLength(2);
  });
});

describe('usa match days', () => {
  test('groups fixtures by USA Eastern calendar day', () => {
    const days = getUsaMatchDaysSorted();
    expect(days.length).toBeGreaterThan(0);
    expect(days[0]).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('daily cron UTC hour covers latest USA-day sync window', () => {
    expect(getDailyCronUtcHour()).toBe(6);
  });

  test('picks next USA match day after last synced', () => {
    const firstDay = getUsaMatchDaysSorted()[0];
    const syncAt = new Date(
      require('../../api/lib/worldcup26/fixtures').getSyncInstantForUsaDay(firstDay)
    );
    const afterWindow = new Date(syncAt.getTime() + 60000);

    expect(getNextUsaMatchDayToSync(afterWindow, null)).toBe(firstDay);
    expect(getNextUsaMatchDayToSync(afterWindow, firstDay)).not.toBe(firstDay);
  });

  test('June 11 USA day includes A-1', () => {
    expect(getFixtureIdsForUsaDay('2026-06-11')).toContain('A-1');
  });
});
