/**
 * Reorganize players.json by team and write per-team files under public/data/players/.
 *
 * Usage: node scripts/reorganize-players.js
 */
const { flattenPlayers, readPlayersJson, writePlayersData } = require('./lib/players-data');

function main() {
  const data = readPlayersJson();
  const flat = flattenPlayers(data);
  const result = writePlayersData(flat, data.lastUpdated ?? new Date().toISOString());

  console.log(`Reorganized ${result.players} players across ${result.teams} teams in public/data/players.json`);
}

main();
