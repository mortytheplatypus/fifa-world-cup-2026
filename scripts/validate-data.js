const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');

const VALID_STAGES = new Set([
  'champion',
  'runnerUp',
  'thirdPlace',
  'semifinal',
  'quarterfinal',
  'roundOf16',
  'group',
]);

const VALID_POSITIONS = new Set(['GK', 'DEF', 'MID', 'FWD']);

function readJson(filename) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, filename), 'utf8'));
}

function validate() {
  const errors = [];
  const teams = readJson('teams.json');
  const squads = readJson('squads.json');
  const players = readJson('players.json');
  const wcHistory = readJson('wc-history.json');

  const teamIds = new Set(teams.map((team) => team.id));
  const playerIds = new Set(Object.keys(players.players ?? {}));

  if (!squads.squads) {
    errors.push('squads.json: missing squads object');
  }

  if (!players.players) {
    errors.push('players.json: missing players object');
  }

  if (!wcHistory.teams) {
    errors.push('wc-history.json: missing teams object');
  }

  for (const team of teams) {
    if (!squads.squads?.[team.id]) {
      errors.push(`Missing squad for team ${team.id}`);
    }
    if (!wcHistory.teams?.[team.id]) {
      errors.push(`Missing WC history for team ${team.id}`);
    }
  }

  for (const [teamId, squad] of Object.entries(squads.squads ?? {})) {
    if (!teamIds.has(teamId)) {
      errors.push(`Squad references unknown team ${teamId}`);
    }

    if (!squad.coach?.name) {
      errors.push(`Squad ${teamId}: missing coach name`);
    }

    if (!Array.isArray(squad.playerIds) || squad.playerIds.length < 20) {
      errors.push(`Squad ${teamId}: expected at least 20 playerIds, got ${squad.playerIds?.length ?? 0}`);
    }

    const shirtNumbers = new Set();
    for (const pid of squad.playerIds ?? []) {
      if (!playerIds.has(pid)) {
        errors.push(`Squad ${teamId}: unknown playerId ${pid}`);
      }
      const player = players.players[pid];
      if (player?.shirtNumber != null) {
        if (shirtNumbers.has(player.shirtNumber)) {
          errors.push(`Squad ${teamId}: duplicate shirt number ${player.shirtNumber}`);
        }
        shirtNumbers.add(player.shirtNumber);
      }
    }

    if (squad.captain && !playerIds.has(squad.captain)) {
      errors.push(`Squad ${teamId}: captain ${squad.captain} not in players`);
    }
  }

  for (const [pid, player] of Object.entries(players.players ?? {})) {
    if (!teamIds.has(player.teamId)) {
      errors.push(`Player ${pid}: unknown teamId ${player.teamId}`);
    }
    if (!VALID_POSITIONS.has(player.position)) {
      errors.push(`Player ${pid}: invalid position ${player.position}`);
    }
    if (player.id !== pid) {
      errors.push(`Player ${pid}: id field mismatch (${player.id})`);
    }
  }

  for (const [teamId, history] of Object.entries(wcHistory.teams ?? {})) {
    if (!teamIds.has(teamId)) {
      errors.push(`WC history references unknown team ${teamId}`);
    }

    if (typeof history.championships !== 'number') {
      errors.push(`WC history ${teamId}: championships must be a number`);
    }

    if (!Array.isArray(history.tournaments)) {
      errors.push(`WC history ${teamId}: tournaments must be an array`);
      continue;
    }

    if (history.appearances !== history.tournaments.length) {
      errors.push(
        `WC history ${teamId}: appearances (${history.appearances}) != tournaments length (${history.tournaments.length})`
      );
    }

    for (const tournament of history.tournaments) {
      if (!VALID_STAGES.has(tournament.stage)) {
        errors.push(`WC history ${teamId} ${tournament.year}: invalid stage ${tournament.stage}`);
      }
      if (!Array.isArray(tournament.squadPlayerIds) || tournament.squadPlayerIds.length < 15) {
        errors.push(
          `WC history ${teamId} ${tournament.year}: expected at least 15 squadPlayerIds`
        );
      }
      for (const pid of tournament.squadPlayerIds ?? []) {
        if (!playerIds.has(pid)) {
          errors.push(`WC history ${teamId} ${tournament.year}: unknown playerId ${pid}`);
        }
      }
    }
  }

  if (errors.length > 0) {
    console.error(`Validation failed with ${errors.length} error(s):`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  console.log('Validation passed.');
  console.log(`  Teams: ${teams.length}`);
  console.log(`  Squads: ${Object.keys(squads.squads).length}`);
  console.log(`  Players: ${Object.keys(players.players).length}`);
  console.log(
    `  WC tournaments: ${Object.values(wcHistory.teams).reduce((sum, t) => sum + t.tournaments.length, 0)}`
  );
}

validate();
