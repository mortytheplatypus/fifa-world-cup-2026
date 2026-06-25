export const GROUP_TIEBREAKER_RULES = {
  title: 'Equal points within a group (Article 13)',
  intro:
    'If two or more teams are equal on points after all group matches, ranking is determined in the following order.',
  steps: [
    {
      title: 'Step 1: Head-to-head (matches between tied teams)',
      criteria: [
        'Greatest number of points obtained in matches between the teams concerned.',
        'Superior goal difference resulting from matches between the teams concerned.',
        'Greatest number of goals scored in matches between the teams concerned.',
      ],
    },
    {
      title: 'Step 2: Overall group performance',
      criteria: [
        'If teams are still tied, criteria (a) to (c) are re-applied only among the teams still equal.',
        'Superior goal difference in all group matches.',
        'Greatest number of goals scored in all group matches.',
        'Highest team conduct score (see below).',
      ],
    },
    {
      title: 'Step 3: FIFA ranking',
      criteria: [
        'Ranking according to the most recent published FIFA/Coca-Cola Men\'s World Ranking.',
        'If still equal, the ranking immediately preceding the most recent one, continuing backwards until a decision is made.',
      ],
    },
  ],
};

export const CONDUCT_SCORE_RULES = {
  title: 'Team conduct score',
  intro:
    'Only one disciplinary deduction is applied per player or team official per match.',
  deductions: [
    { card: 'Yellow card', points: '−1' },
    { card: 'Indirect red card (two yellows)', points: '−3' },
    { card: 'Direct red card', points: '−4' },
    { card: 'Yellow card and direct red card', points: '−5' },
  ],
  note: 'The team with the highest conduct score (fewest deductions) is ranked highest.',
};

export const THIRD_PLACE_QUALIFICATION_RULES = {
  title: 'Eight best third-placed teams',
  intro:
    'The 12 group winners and 12 group runners-up qualify automatically. Among the 12 third-placed teams, the eight best-ranked advance to the Round of 32. They are ranked by:',
  criteria: [
    'Greatest number of points obtained in all group matches.',
    'Goal difference resulting from all group matches.',
    'Greatest number of goals scored in all group matches.',
    'Highest team conduct score in all group matches.',
    'Ranking according to the most recent published FIFA/Coca-Cola Men\'s World Ranking.',
    'Ranking according to the FIFA/Coca-Cola Men\'s World Ranking immediately preceding the most recent one, continuing backwards until a decision is made.',
  ],
};

export const RANKING_LIMITATION_NOTE =
  'This app ranks third-placed teams using points, goal difference, and goals scored only. Conduct score and FIFA ranking tiebreakers are not applied because that data is not available.';
