const fs = require('fs');
const path = require('path');
const {
  createCurrentPlayer,
  createHistoricalPlayer,
  mergePlayer,
  playerId,
  sortByPosition,
} = require('./lib/player-utils');
const { currentSquads, wcRecords } = require('./data/team-seed-data');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const teams = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'teams.json'), 'utf8'));

const teamById = Object.fromEntries(teams.map((team) => [team.id, team]));
const playersMap = {};
const squadsOut = { lastUpdated: new Date().toISOString(), squads: {} };
const wcHistoryOut = { lastUpdated: new Date().toISOString(), teams: {} };

function upsertPlayer(player) {
  const existing = playersMap[player.id];
  playersMap[player.id] = existing ? mergePlayer(existing, player) : player;
}

for (const team of teams) {
  const squadData = currentSquads[team.id];
  if (!squadData) {
    throw new Error(`Missing current squad data for ${team.id}`);
  }

  const currentPlayerIds = [];

  for (const playerData of squadData.players) {
    const player = createCurrentPlayer(team, playerData);
    upsertPlayer(player);
    currentPlayerIds.push(player.id);
  }

  const sortedIds = sortByPosition(
    currentPlayerIds.map((id) => playersMap[id])
  ).map((player) => player.id);

  const captainName = squadData.captain;
  const captainId =
    captainName && sortedIds.includes(playerId(team.id, captainName))
      ? playerId(team.id, captainName)
      : sortedIds[0];

  squadsOut.squads[team.id] = {
    coach: squadData.coach,
    captain: captainId,
    playerIds: sortedIds,
  };

  const wcData = wcRecords[team.id];
  if (!wcData) {
    throw new Error(`Missing WC records for ${team.id}`);
  }

  const tournaments = wcData.tournaments.map((tournament) => {
    const squadPlayerIds = tournament.squad.map((entry) => {
      const name = typeof entry === 'string' ? entry : entry.name;
      const position = typeof entry === 'string' ? 'MID' : entry.position ?? 'MID';
      const id = playerId(team.id, name);

      if (!playersMap[id]) {
        upsertPlayer(
          createHistoricalPlayer(team, name, position, tournament.year, {
            shirtNumber: typeof entry === 'object' ? entry.shirtNumber : null,
            goals: typeof entry === 'object' ? entry.goals : 0,
            role: typeof entry === 'object' ? entry.role : 'squad',
          })
        );
      } else if (!playersMap[id].worldCups?.some((wc) => wc.year === tournament.year)) {
        upsertPlayer(
          createHistoricalPlayer(team, name, position, tournament.year, {
            goals: typeof entry === 'object' ? entry.goals : 0,
          })
        );
      }

      return id;
    });

    return {
      year: tournament.year,
      host: tournament.host,
      stage: tournament.stage,
      stageLabel: tournament.stageLabel,
      squadPlayerIds,
    };
  });

  wcHistoryOut.teams[team.id] = {
    championships: wcData.championships,
    bestFinish: wcData.bestFinish,
    appearances: tournaments.length,
    tournaments,
  };
}

const playersOut = {
  lastUpdated: new Date().toISOString(),
  players: playersMap,
};

fs.writeFileSync(path.join(DATA_DIR, 'squads.json'), JSON.stringify(squadsOut, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'players.json'), JSON.stringify(playersOut, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'wc-history.json'), JSON.stringify(wcHistoryOut, null, 2));

console.log(`Generated squads for ${Object.keys(squadsOut.squads).length} teams`);
console.log(`Generated ${Object.keys(playersOut.players).length} players`);
console.log(
  `Generated WC history with ${Object.values(wcHistoryOut.teams).reduce((sum, t) => sum + t.tournaments.length, 0)} tournaments`
);
