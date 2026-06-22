#!/usr/bin/env node
/**
 * Compact full seed generator — writes team-seed-data.js directly.
 */
const fs = require('fs');
const path = require('path');
const { cp, sq, tour, serialize } = require('./seed-helpers');

function P(name, pos, num, club, dob, h, foot, caps, goals, wca = 0, wcg = 0) {
  return cp(name, pos, num, club, dob, h, foot, caps, goals, wca, wcg);
}

function team(coachName, coachNat, captain, players) {
  return { coach: { name: coachName, nationality: coachNat }, captain, players };
}

function wc(championships, bestFinish, tournaments) {
  return { championships, bestFinish, tournaments };
}

function names(...entries) {
  return sq(...entries);
}

// Squad from current player names (for 2026 first-time teams)
function squadFromPlayers(players) {
  return players.map((p) => ({ name: p.name, position: p.position }));
}

const currentSquads = {
  MEX: team('Javier Aguirre', 'Mexico', 'Guillermo Ochoa', [
    P('Guillermo Ochoa', 'GK', 13, 'Santa Fe', '1985-07-13', 185, 'right', 155, 0, 4, 0),
    P('Luis Malagón', 'GK', 1, 'América', '1997-03-02', 185, 'right', 12, 0),
    P('Raúl Rangel', 'GK', 22, 'Guadalajara', '2000-05-20', 188, 'right', 3, 0),
    P('Jorge Sánchez', 'DEF', 2, 'Ajax', '1997-12-10', 178, 'right', 35, 1, 1),
    P('César Montes', 'DEF', 3, 'Monterrey', '1997-02-24', 190, 'right', 45, 3, 2),
    P('Johan Vásquez', 'DEF', 5, 'Genoa', '1998-10-22', 188, 'left', 30, 2, 1),
    P('Gerardo Arteaga', 'DEF', 4, 'Monterrey', '1998-09-07', 175, 'left', 28, 1, 1),
    P('Vladimir Loroña', 'DEF', 15, 'Tijuana', '1998-11-16', 175, 'right', 18, 0),
    P('Carlos Rodríguez', 'MID', 8, 'Cruz Azul', '1997-08-03', 175, 'right', 55, 3, 2),
    P('Luis Chávez', 'MID', 6, 'Mazatlán', '1996-12-24', 180, 'left', 40, 4, 1),
    P('Orbelín Pineda', 'MID', 17, 'AEK Athens', '1996-04-24', 170, 'right', 65, 8, 3),
    P('Érick Gutiérrez', 'MID', 14, 'PSV', '1995-06-15', 178, 'right', 50, 2, 2),
    P('Luis Quiñones', 'MID', 16, 'Toluca', '1996-03-27', 180, 'right', 22, 3),
    P('Roberto Alvarado', 'MID', 11, 'Cruz Azul', '1998-09-07', 175, 'right', 42, 5, 1),
    P('Uriel Antuna', 'MID', 7, 'América', '1997-08-21', 173, 'right', 38, 5, 1),
    P('Alexis Vega', 'MID', 10, 'Guadalajara', '1997-11-25', 175, 'right', 25, 4),
    P('Erick Sánchez', 'MID', 12, 'Houston Dynamo', '1999-11-16', 175, 'right', 20, 1),
    P('Santiago Giménez', 'FWD', 9, 'Feyenoord', '2001-04-18', 182, 'right', 35, 15, 1, 2),
    P('Raúl Jiménez', 'FWD', 19, 'Fulham', '1991-05-05', 189, 'right', 110, 35, 3, 4),
    P('Henry Martín', 'FWD', 21, 'América', '1992-11-18', 180, 'right', 30, 8, 1),
    P('Julián Quiñones', 'FWD', 20, 'América', '1997-03-24', 185, 'right', 15, 5),
    P('Jesús Hernández', 'FWD', 18, 'América', '2003-05-06', 175, 'right', 5, 1),
    P('Jesús Angulo', 'FWD', 23, 'Guadalajara', '1997-02-20', 175, 'right', 8, 2),
  ]),
};

// Load extended squads from separate module
Object.assign(currentSquads, require('./seed-all-squads').squads);

const wcRecords = require('./seed-all-history').history;

const TEAM_IDS = [
  'MEX', 'RSA', 'KOR', 'CZE', 'CAN', 'BIH', 'QAT', 'SUI', 'BRA', 'MAR', 'HAI', 'SCO',
  'USA', 'PAR', 'AUS', 'TUR', 'GER', 'CUW', 'CIV', 'ECU', 'NED', 'JPN', 'SWE', 'TUN',
  'BEL', 'EGY', 'IRN', 'NZL', 'ESP', 'CPV', 'KSA', 'URU', 'FRA', 'SEN', 'IRQ', 'NOR',
  'ARG', 'ALG', 'AUT', 'JOR', 'POR', 'COD', 'UZB', 'COL', 'ENG', 'CRO', 'GHA', 'PAN',
];

for (const id of TEAM_IDS) {
  if (!currentSquads[id]) throw new Error(`Missing currentSquads for ${id}`);
  if (!wcRecords[id]) throw new Error(`Missing wcRecords for ${id}`);
  const s = currentSquads[id];
  if (s.players.length < 23 || s.players.length > 26) {
    throw new Error(`${id}: ${s.players.length} players`);
  }
  if (!s.players.find((p) => p.name === s.captain)) {
    throw new Error(`${id}: captain not found`);
  }
  for (const t of wcRecords[id].tournaments) {
    if (t.squad.length !== 23) throw new Error(`${id} ${t.year}: ${t.squad.length} squad`);
  }
}

const out = `// Generated seed data for FIFA World Cup 2026\nconst currentSquads = ${serialize(currentSquads, 0)};\n\nconst wcRecords = ${serialize(wcRecords, 0)};\n\nmodule.exports = { currentSquads, wcRecords };\n`;

const OUT = path.join(__dirname, 'team-seed-data.js');
fs.writeFileSync(OUT, out);
console.log(`Wrote ${OUT}: ${out.split('\n').length} lines`);
