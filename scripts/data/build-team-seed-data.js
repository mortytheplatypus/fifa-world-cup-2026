#!/usr/bin/env node
/**
 * Generates scripts/data/team-seed-data.js from seed modules.
 * Run: node scripts/data/build-team-seed-data.js
 */
const fs = require('fs');
const path = require('path');
const { serialize } = require('./seed-helpers');

const { squads: currentSquads } = require('./seed-all-squads');
const { history: wcRecords } = require('./seed-all-history');

const TEAM_IDS = [
  'MEX', 'RSA', 'KOR', 'CZE', 'CAN', 'BIH', 'QAT', 'SUI', 'BRA', 'MAR', 'HAI', 'SCO',
  'USA', 'PAR', 'AUS', 'TUR', 'GER', 'CUW', 'CIV', 'ECU', 'NED', 'JPN', 'SWE', 'TUN',
  'BEL', 'EGY', 'IRN', 'NZL', 'ESP', 'CPV', 'KSA', 'URU', 'FRA', 'SEN', 'IRQ', 'NOR',
  'ARG', 'ALG', 'AUT', 'JOR', 'POR', 'COD', 'UZB', 'COL', 'ENG', 'CRO', 'GHA', 'PAN',
];

for (const id of TEAM_IDS) {
  if (!currentSquads[id]) throw new Error(`Missing currentSquads for ${id}`);
  if (!wcRecords[id]) throw new Error(`Missing wcRecords for ${id}`);
  const squad = currentSquads[id];
  if (!squad.players || squad.players.length < 23 || squad.players.length > 26) {
    throw new Error(`${id}: expected 23-26 players, got ${squad.players?.length}`);
  }
  const captainPlayer = squad.players.find((p) => p.name === squad.captain);
  if (!captainPlayer) throw new Error(`${id}: captain "${squad.captain}" not in players`);
  for (const t of wcRecords[id].tournaments) {
    if (!t.squad || t.squad.length !== 23) {
      throw new Error(`${id} ${t.year}: expected 23 squad players, got ${t.squad?.length}`);
    }
  }
}

const out = `// Generated seed data for FIFA World Cup 2026
const currentSquads = ${serialize(currentSquads, 0)};

const wcRecords = ${serialize(wcRecords, 0)};

module.exports = { currentSquads, wcRecords };
`;

const OUT = path.join(__dirname, 'team-seed-data.js');
fs.writeFileSync(OUT, out);
const lines = out.split('\n').length;
console.log(`Wrote ${OUT} (${lines} lines)`);
