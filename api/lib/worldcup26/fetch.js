const GAMES_URL = 'https://worldcup26.ir/get/games';

async function fetchGames() {
  const response = await fetch(GAMES_URL);

  if (!response.ok) {
    throw new Error(`Failed to fetch games: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (!Array.isArray(data?.games)) {
    throw new Error('Invalid games response: expected { games: [...] }');
  }

  return data.games;
}

module.exports = { fetchGames, GAMES_URL };
