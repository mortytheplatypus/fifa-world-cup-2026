import { computeConductScore, computeGroupStandings } from './standings';

const groupHTeams = [
  { id: 'ESP', name: 'Spain', fifaRankingPreWc: 2 },
  { id: 'CPV', name: 'Cape Verde', fifaRankingPreWc: 67 },
  { id: 'KSA', name: 'Saudi Arabia', fifaRankingPreWc: 61 },
  { id: 'URU', name: 'Uruguay', fifaRankingPreWc: 16 },
];

const groupHFixturesMd1 = [
  {
    id: 'H-1',
    homeTeam: 'ESP',
    awayTeam: 'CPV',
    homeScore: 0,
    awayScore: 0,
    cards: [
      { team: 'home', type: 'yellow' },
      { team: 'away', type: 'yellow' },
    ],
  },
  {
    id: 'H-2',
    homeTeam: 'KSA',
    awayTeam: 'URU',
    homeScore: 1,
    awayScore: 1,
    cards: [{ team: 'home', type: 'yellow' }],
  },
];

describe('computeGroupStandings', () => {
  test('sorts by points when teams are not tied', () => {
    const teams = [
      { id: 'A', name: 'Alpha', fifaRankingPreWc: 10 },
      { id: 'B', name: 'Beta', fifaRankingPreWc: 20 },
    ];
    const fixtures = [
      { homeTeam: 'A', awayTeam: 'B', homeScore: 2, awayScore: 0 },
    ];

    const standings = computeGroupStandings(teams, fixtures);
    expect(standings.map((row) => row.team.id)).toEqual(['A', 'B']);
    expect(standings[0].points).toBe(3);
    expect(standings[1].points).toBe(0);
  });

  test('Group H MD1 uses FIFA tie-breakers (URU, KSA, ESP, CPV)', () => {
    const standings = computeGroupStandings(groupHTeams, groupHFixturesMd1);
    expect(standings.map((row) => row.team.id)).toEqual(['URU', 'KSA', 'ESP', 'CPV']);
  });

  test('Step 1 H2H goals scored separates tied teams in a mini-league', () => {
    const teams = [
      { id: 'A', name: 'A', fifaRankingPreWc: 99 },
      { id: 'B', name: 'B', fifaRankingPreWc: 99 },
      { id: 'C', name: 'C', fifaRankingPreWc: 99 },
      { id: 'D', name: 'D', fifaRankingPreWc: 99 },
    ];
    const fixtures = [
      { homeTeam: 'A', awayTeam: 'B', homeScore: 1, awayScore: 1 },
      { homeTeam: 'C', awayTeam: 'D', homeScore: 0, awayScore: 0 },
    ];

    const standings = computeGroupStandings(teams, fixtures);
    expect(standings.map((row) => row.team.id)).toEqual(['A', 'B', 'C', 'D']);
    expect(standings.every((row) => row.points === 1)).toBe(true);
  });

  test('conduct score breaks a tie when records are equal', () => {
    const teams = [
      { id: 'A', name: 'A', fifaRankingPreWc: 50 },
      { id: 'B', name: 'B', fifaRankingPreWc: 40 },
    ];
    const fixtures = [
      {
        homeTeam: 'A',
        awayTeam: 'B',
        homeScore: 1,
        awayScore: 1,
        cards: [{ team: 'home', type: 'yellow' }],
      },
    ];

    const standings = computeGroupStandings(teams, fixtures);
    expect(standings.map((row) => row.team.id)).toEqual(['B', 'A']);
  });

  test('FIFA ranking breaks a tie when conduct is equal', () => {
    const teams = [
      { id: 'A', name: 'A', fifaRankingPreWc: 67 },
      { id: 'B', name: 'B', fifaRankingPreWc: 2 },
    ];
    const fixtures = [
      {
        homeTeam: 'A',
        awayTeam: 'B',
        homeScore: 0,
        awayScore: 0,
        cards: [
          { team: 'home', type: 'yellow' },
          { team: 'away', type: 'yellow' },
        ],
      },
    ];

    const standings = computeGroupStandings(teams, fixtures);
    expect(standings.map((row) => row.team.id)).toEqual(['B', 'A']);
  });
});

describe('computeConductScore', () => {
  test('sums card deductions for a team across group fixtures', () => {
    const fixtures = [
      {
        homeTeam: 'A',
        awayTeam: 'B',
        homeScore: 1,
        awayScore: 0,
        cards: [
          { team: 'home', type: 'yellow' },
          { team: 'away', type: 'directRed' },
        ],
      },
      {
        homeTeam: 'B',
        awayTeam: 'A',
        homeScore: 0,
        awayScore: 0,
        cards: [{ team: 'home', type: 'secondYellow' }],
      },
    ];

    expect(computeConductScore('A', fixtures)).toBe(-1);
    expect(computeConductScore('B', fixtures)).toBe(-7);
  });
});
