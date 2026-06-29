const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'public', 'data');
const PLAYERS_DIR = path.join(DATA_DIR, 'players');

function isNestedByTeam(playersRoot) {
  const first = Object.values(playersRoot ?? {})[0];
  return Boolean(first && typeof first === 'object' && !first.id);
}

function flattenPlayers(playersData) {
  const root = playersData.players ?? playersData;
  if (!isNestedByTeam(root)) {
    return root;
  }

  const flat = {};
  for (const teamPlayers of Object.values(root)) {
    for (const [playerId, player] of Object.entries(teamPlayers ?? {})) {
      flat[playerId] = player;
    }
  }
  return flat;
}

function groupPlayersByTeam(flatPlayers) {
  const grouped = {};
  for (const [playerId, player] of Object.entries(flatPlayers ?? {})) {
    const teamId = player.teamId;
    if (!teamId) continue;
    if (!grouped[teamId]) {
      grouped[teamId] = {};
    }
    grouped[teamId][playerId] = player;
  }
  return grouped;
}

function writePlayersData(flatPlayers, lastUpdated = new Date().toISOString()) {
  const grouped = groupPlayersByTeam(flatPlayers);

  const playersOut = {
    lastUpdated,
    players: grouped,
  };

  fs.writeFileSync(path.join(DATA_DIR, 'players.json'), `${JSON.stringify(playersOut, null, 2)}\n`);

  return {
    teams: Object.keys(grouped).length,
    players: Object.keys(flatPlayers).length,
  };
}

function readPlayersJson() {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'players.json'), 'utf8'));
}

module.exports = {
  DATA_DIR,
  PLAYERS_DIR,
  isNestedByTeam,
  flattenPlayers,
  groupPlayersByTeam,
  writePlayersData,
  readPlayersJson,
};
