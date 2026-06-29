/**
 * Sync 2026 World Cup squads and player profiles from Wikipedia squad tables.
 * Source: https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads
 *
 * Usage: node scripts/update-2026-squads.js [--dry-run]
 */
const fs = require('fs');
const path = require('path');
const https = require('https');
const {
  createSquadPlayer,
  normalizeName,
  playerId,
} = require('./lib/player-utils');
const { flattenPlayers, writePlayersData } = require('./lib/players-data');

const DATA_DIR = path.join(__dirname, '..', 'public', 'data');
const WIKI_URL = 'https://en.wikipedia.org/wiki/2026_FIFA_World_Cup_squads';
const dryRun = process.argv.includes('--dry-run');

const WIKI_TEAM_TO_ID = {
  'Czech Republic': 'CZE',
  Mexico: 'MEX',
  'South Africa': 'RSA',
  'South Korea': 'KOR',
  'Bosnia and Herzegovina': 'BIH',
  Canada: 'CAN',
  Qatar: 'QAT',
  Switzerland: 'SUI',
  Brazil: 'BRA',
  Haiti: 'HAI',
  Morocco: 'MAR',
  Scotland: 'SCO',
  Australia: 'AUS',
  Paraguay: 'PAR',
  Turkey: 'TUR',
  'United States': 'USA',
  Curaçao: 'CUW',
  Ecuador: 'ECU',
  Germany: 'GER',
  'Ivory Coast': 'CIV',
  Japan: 'JPN',
  Netherlands: 'NED',
  Sweden: 'SWE',
  Tunisia: 'TUN',
  Belgium: 'BEL',
  Egypt: 'EGY',
  Iran: 'IRN',
  'New Zealand': 'NZL',
  'Cape Verde': 'CPV',
  'Saudi Arabia': 'KSA',
  Spain: 'ESP',
  Uruguay: 'URU',
  France: 'FRA',
  Iraq: 'IRQ',
  Norway: 'NOR',
  Senegal: 'SEN',
  Algeria: 'ALG',
  Argentina: 'ARG',
  Austria: 'AUT',
  Jordan: 'JOR',
  Colombia: 'COL',
  'DR Congo': 'COD',
  Portugal: 'POR',
  Uzbekistan: 'UZB',
  Croatia: 'CRO',
  England: 'ENG',
  Ghana: 'GHA',
  Panama: 'PAN',
};

function fetchWikiText() {
  return new Promise((resolve, reject) => {
    https
      .get(
        WIKI_URL,
        { headers: { 'User-Agent': 'fifa-wc-2026-data-sync/1.0' } },
        (res) => {
          if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
            fetchWikiTextFromUrl(res.headers.location).then(resolve).catch(reject);
            return;
          }
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => resolve(data));
        }
      )
      .on('error', reject);
  });
}

function fetchWikiTextFromUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, { headers: { 'User-Agent': 'fifa-wc-2026-data-sync/1.0' } }, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => resolve(data));
      })
      .on('error', reject);
  });
}

function htmlToMarkdownTables(html) {
  const sections = html.split(/<h3[^>]*>/i).slice(1);
  const squads = {};

  for (const section of sections) {
    const headingEnd = section.indexOf('</h3>');
    if (headingEnd === -1) continue;

    const heading = section
      .slice(0, headingEnd)
      .replace(/<[^>]+>/g, '')
      .trim();
    const teamId = WIKI_TEAM_TO_ID[heading];
    if (!teamId) continue;

    const body = section.slice(headingEnd);
    const coachMatch = body.match(/Coach:\s*([^<\n]+)/i);
    const coachName = coachMatch?.[1]?.split('(')[0]?.trim() ?? null;

    const tableMatch = body.match(/<table[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/i);
    if (!tableMatch) continue;

    const rows = [...tableMatch[1].matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
    const players = [];

    for (const row of rows.slice(1)) {
      const cells = [...row[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) =>
        cell[1]
          .replace(/<br\s*\/?>/gi, ' ')
          .replace(/<[^>]+>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
      );

      if (cells.length < 7) continue;

      const shirtNumber = Number.parseInt(cells[0], 10);
      const posCode = cells[1];
      let playerName = cells[2].replace(/\(captain\)/gi, '').trim();
      const isCaptain = /\(captain\)/i.test(cells[2]);

      const dobMatch = cells[3].match(/\((\d{4}-\d{2}-\d{2})\)/);
      const dateOfBirth = dobMatch?.[1] ?? null;
      const caps = Number.parseInt(cells[4], 10) || 0;
      const goals = Number.parseInt(cells[5], 10) || 0;
      const club = cells[6];

      players.push({
        shirtNumber,
        posCode,
        name: playerName,
        isCaptain,
        dateOfBirth,
        caps,
        goals,
        club,
      });
    }

    if (players.length) {
      squads[teamId] = {
        coachName,
        players,
      };
    }
  }

  return squads;
}

function parseMarkdownTables(markdown) {
  const lines = markdown.split('\n');
  const squads = {};
  let currentTeamId = null;
  let coachName = null;
  let inTable = false;

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    const headingMatch = line.match(/^### (.+)$/);
    if (headingMatch) {
      currentTeamId = WIKI_TEAM_TO_ID[headingMatch[1].trim()] ?? null;
      coachName = null;
      inTable = false;
      continue;
    }

    if (!currentTeamId) continue;

    const coachMatch = line.match(/^Coach:\s*(.+)$/);
    if (coachMatch) {
      coachName = coachMatch[1].split('(')[0].trim();
      continue;
    }

    if (line.startsWith('| No. |')) {
      inTable = true;
      if (!squads[currentTeamId]) {
        squads[currentTeamId] = { coachName: null, players: [] };
      }
      squads[currentTeamId].coachName = coachName;
      continue;
    }

    if (!inTable || !line.startsWith('|')) continue;
    if (line.match(/^\| ---/)) continue;

    const cells = line
      .split('|')
      .slice(1, -1)
      .map((cell) => cell.trim());
    if (cells.length < 7) continue;

    const shirtNumber = Number.parseInt(cells[0], 10);
    const posCode = cells[1];
    const rawName = cells[2];
    const isCaptain = /\(captain\)/i.test(rawName);
    const name = rawName.replace(/\(captain\)/gi, '').trim();
    const dobMatch = cells[3].match(/\((\d{4}-\d{2}-\d{2})\)/);
    const dateOfBirth = dobMatch?.[1] ?? null;
    const caps = Number.parseInt(cells[4], 10) || 0;
    const goals = Number.parseInt(cells[5], 10) || 0;
    const club = cells[6];

    squads[currentTeamId].players.push({
      shirtNumber,
      posCode,
      name,
      isCaptain,
      dateOfBirth,
      caps,
      goals,
      club,
    });
  }

  return squads;
}

function buildPlayerLookup(playersMap) {
  const byTeamName = new Map();
  for (const player of Object.values(playersMap)) {
    const key = `${player.teamId}:${normalizeName(player.name)}`;
    byTeamName.set(key, player);
  }
  return byTeamName;
}

function findExistingPlayer(lookup, teamId, name) {
  return lookup.get(`${teamId}:${normalizeName(name)}`) ?? null;
}

async function loadWikiSquads() {
  const cachedPath = path.join(__dirname, 'data', 'wc2026-squads-wiki.txt');
  if (fs.existsSync(cachedPath)) {
    return parseMarkdownTables(fs.readFileSync(cachedPath, 'utf8'));
  }

  const html = await fetchWikiText();
  const fromHtml = htmlToMarkdownTables(html);
  if (Object.keys(fromHtml).length >= 48) {
    return fromHtml;
  }

  throw new Error('Could not parse Wikipedia squads — add scripts/data/wc2026-squads-wiki.txt cache');
}

async function main() {
  const teams = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'teams.json'), 'utf8'));
  const squadsData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'squads.json'), 'utf8'));
  const playersData = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'players.json'), 'utf8'));

  const teamById = Object.fromEntries(teams.map((team) => [team.id, team]));
  const wikiSquads = await loadWikiSquads();
  const playerLookup = buildPlayerLookup(flattenPlayers(playersData));
  const updatedSquads = { ...squadsData.squads };
  const updatedPlayers = { ...flattenPlayers(playersData) };

  let teamsUpdated = 0;
  let playersCreated = 0;
  let playersUpdated = 0;

  for (const team of teams) {
    const wiki = wikiSquads[team.id];
    if (!wiki?.players?.length) {
      console.warn(`No Wikipedia squad for ${team.id} (${team.name})`);
      continue;
    }

    const existingSquad = squadsData.squads[team.id] ?? {};
    const playerIds = [];
    let captainId = existingSquad.captain ?? null;

    for (const wikiPlayer of wiki.players) {
      const existing = findExistingPlayer(playerLookup, team.id, wikiPlayer.name);
      const { mapPosition } = require('./lib/player-utils');
      const player = createSquadPlayer({
        teamId: team.id,
        flagCode: team.flagCode,
        name: wikiPlayer.name,
        position: mapPosition(wikiPlayer.posCode),
        shirtNumber: wikiPlayer.shirtNumber,
        club: wikiPlayer.club,
        dateOfBirth: wikiPlayer.dateOfBirth,
        caps: wikiPlayer.caps,
        internationalGoals: wikiPlayer.goals,
        existing,
      });

      const isNew = !updatedPlayers[player.id];
      updatedPlayers[player.id] = player;
      playerLookup.set(`${team.id}:${normalizeName(player.name)}`, player);
      playerIds.push(player.id);

      if (wikiPlayer.isCaptain) {
        captainId = player.id;
      }

      if (isNew) playersCreated += 1;
      else playersUpdated += 1;
    }

    updatedSquads[team.id] = {
      coach: {
        name: wiki.coachName ?? existingSquad.coach?.name ?? 'TBC',
        nationality: existingSquad.coach?.nationality ?? team.name,
      },
      captain: captainId,
      playerIds,
    };

    teamsUpdated += 1;
    console.log(`${team.id}: ${playerIds.length} players (coach: ${wiki.coachName})`);
  }

  const squadsOut = {
    lastUpdated: new Date().toISOString(),
    squads: updatedSquads,
  };

  if (dryRun) {
    console.log(`\nDry run: would update ${teamsUpdated} squads, ${playersCreated} new players, ${playersUpdated} updated players`);
    return;
  }

  fs.writeFileSync(path.join(DATA_DIR, 'squads.json'), `${JSON.stringify(squadsOut, null, 2)}\n`);
  writePlayersData(updatedPlayers, squadsOut.lastUpdated);
  console.log(`\nWrote squads.json and players.json (${teamsUpdated} teams)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
