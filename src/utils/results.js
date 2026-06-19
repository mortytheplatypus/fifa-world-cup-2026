function goalMinuteSortKey(minute) {
  const [base, extra = '0'] = String(minute).split('+');
  return Number(base) * 100 + Number(extra);
}

export function sortGoals(goals = []) {
  return [...goals].sort(
    (a, b) => goalMinuteSortKey(a.minute) - goalMinuteSortKey(b.minute)
  );
}

export function getGoalsBySide(goals = []) {
  const sorted = sortGoals(goals);

  return {
    home: sorted.filter((goal) => goal.team === 'home'),
    away: sorted.filter((goal) => goal.team === 'away'),
  };
}

export const CARD_DISPLAY = {
  yellow: { emoji: '🟨', label: 'Yellow' },
  secondYellow: { emoji: '🟨', label: '2nd yellow' },
  directRed: { emoji: '🟥', label: 'Direct red' },
  yellowAndDirectRed: { emoji: '🟨🟥', label: 'YC + direct red' },
};

export function getCardDisplay(card) {
  return CARD_DISPLAY[card.type] ?? { emoji: '🟨', label: card.type };
}

export function getCardPlayerName(card) {
  return card.player ?? card.scorer ?? card.name ?? null;
}

export function sortCards(cards = []) {
  return [...cards].sort((a, b) => {
    const aKey = a.minute != null ? goalMinuteSortKey(a.minute) : Number.MAX_SAFE_INTEGER;
    const bKey = b.minute != null ? goalMinuteSortKey(b.minute) : Number.MAX_SAFE_INTEGER;
    return aKey - bKey;
  });
}

export function getCardsBySide(cards = []) {
  const sorted = sortCards(cards);

  return {
    home: sorted.filter((card) => card.team === 'home'),
    away: sorted.filter((card) => card.team === 'away'),
  };
}

export function applyMatchResults(fixturesByGroup, results) {
  const matchResults = results?.matches ?? {};

  return Object.fromEntries(
    Object.entries(fixturesByGroup).map(([group, fixtures]) => [
      group,
      fixtures.map((fixture) => {
        const result = matchResults[fixture.id];
        if (!result) return fixture;

        return {
          ...fixture,
          homeScore: result.homeScore,
          awayScore: result.awayScore,
          goals: result.goals ?? [],
          cards: result.cards ?? [],
        };
      }),
    ])
  );
}
