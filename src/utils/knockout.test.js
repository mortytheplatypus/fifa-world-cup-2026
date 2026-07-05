import { resolveKnockoutMatch } from './knockout';

function standing(id, name) {
  return { team: { id, name, flagCode: 'xx' } };
}

describe('resolveKnockoutMatch score display', () => {
  test('does not carry penalty scores from feeder matches into later rounds', () => {
    const standingsByGroup = {
      A: [standing('a1', 'A Winner'), standing('canada', 'Canada')],
      B: [standing('b1', 'B Winner'), standing('b2', 'B Runner-up')],
      C: [standing('c1', 'C Winner'), standing('morocco', 'Morocco')],
      F: [standing('f1', 'F Winner'), standing('f2', 'F Runner-up')],
    };

    const knockoutResults = {
      M73: { homeScore: 0, awayScore: 1 },
      M75: {
        homeScore: 1,
        awayScore: 1,
        penalties: { home: 2, away: 3 },
      },
      M90: { homeScore: 0, awayScore: 3 },
    };

    const match = resolveKnockoutMatch('M90', standingsByGroup, {
      knockoutResults,
    });

    expect(match.resolvedA.score).toBe(0);
    expect(match.resolvedA.penaltyScore).toBeUndefined();
    expect(match.resolvedB.score).toBe(3);
    expect(match.resolvedB.penaltyScore).toBeUndefined();
  });
});
