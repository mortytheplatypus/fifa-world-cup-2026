import {
  getKnockoutPenalties,
  getKnockoutScoreParts,
  isKnockoutPenaltyDecided,
} from './knockoutPenalties';
import { getKnockoutSideOutcome } from './knockout';

describe('knockoutPenalties', () => {
  test('getKnockoutPenalties returns null when penalties are missing', () => {
    expect(getKnockoutPenalties({ homeScore: 1, awayScore: 1 })).toBeNull();
    expect(
      getKnockoutPenalties({ homeScore: 1, awayScore: 1, penalties: { home: 4 } })
    ).toBeNull();
  });

  test('isKnockoutPenaltyDecided requires a tied regulation score', () => {
    expect(
      isKnockoutPenaltyDecided({
        homeScore: 2,
        awayScore: 1,
        penalties: { home: 4, away: 3 },
      })
    ).toBe(false);

    expect(
      isKnockoutPenaltyDecided({
        homeScore: 1,
        awayScore: 1,
        penalties: { home: 4, away: 3 },
      })
    ).toBe(true);
  });

  test('getKnockoutScoreParts includes penalties only when regulation is tied', () => {
    expect(
      getKnockoutScoreParts(
        { homeScore: 2, awayScore: 1, penalties: { home: 4, away: 3 } },
        'home'
      )
    ).toEqual({ regulation: 2, penalty: null });

    expect(
      getKnockoutScoreParts(
        { homeScore: 1, awayScore: 1, penalties: { home: 4, away: 3 } },
        'away'
      )
    ).toEqual({ regulation: 1, penalty: 3 });
  });
});

describe('knockout penalty winner resolution', () => {
  test('penalties decide the winner when regulation ends level', () => {
    const knockoutResults = {
      M74: {
        homeScore: 1,
        awayScore: 1,
        penalties: { home: 4, away: 3 },
      },
    };

    expect(getKnockoutSideOutcome(knockoutResults.M74, 'A')).toBe('winner');
    expect(getKnockoutSideOutcome(knockoutResults.M74, 'B')).toBe('eliminated');
  });

  test('tied regulation without penalties leaves the match undecided', () => {
    const knockoutResults = {
      M75: {
        homeScore: 1,
        awayScore: 1,
      },
    };

    expect(getKnockoutSideOutcome(knockoutResults.M75, 'A')).toBeNull();
    expect(getKnockoutSideOutcome(knockoutResults.M75, 'B')).toBeNull();
  });

  test('away team wins on penalties', () => {
    const knockoutResults = {
      M75: {
        homeScore: 1,
        awayScore: 1,
        penalties: { home: 3, away: 4 },
      },
    };

    expect(getKnockoutSideOutcome(knockoutResults.M75, 'A')).toBe('eliminated');
    expect(getKnockoutSideOutcome(knockoutResults.M75, 'B')).toBe('winner');
  });
});
