const fs = require('fs');
const path = require('path');
const { flattenPlayers } = require('./players-data');

function loadEnv() {
  const envPath = path.join(__dirname, '..', '..', '.env');
  if (!fs.existsSync(envPath)) {
    return;
  }

  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separator = trimmed.indexOf('=');
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function readJson(dataDir, filename) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, filename), 'utf8'));
}

function chunk(array, size) {
  const chunks = [];
  for (let index = 0; index < array.length; index += size) {
    chunks.push(array.slice(index, index + size));
  }
  return chunks;
}

async function bulkUpsert(collection, operations, batchSize = 500) {
  if (!operations.length) {
    return 0;
  }

  let count = 0;

  for (const batch of chunk(operations, batchSize)) {
    const result = await collection.bulkWrite(batch, { ordered: false });
    count += result.upsertedCount + result.modifiedCount + result.matchedCount;
  }

  return count;
}

function buildTeamDocs(teams) {
  return teams.map((team) => {
    const { id, name, group, flagCode, colors, fifaRankingPreWc, confederation, founded, homeStadium } = team;

    return {
      replaceOne: {
        filter: { _id: id },
        replacement: {
          _id: id,
          name,
          group,
          flagCode,
          ...(colors?.length ? { colors } : {}),
          ...(fifaRankingPreWc != null ? { fifaRankingPreWc } : {}),
          ...(confederation ? { confederation } : {}),
          ...(founded != null ? { founded } : {}),
          ...(homeStadium ? { homeStadium } : {}),
        },
        upsert: true,
      },
    };
  });
}

function buildFixtureDocs(fixturesByGroup) {
  const operations = [];

  for (const [group, fixtures] of Object.entries(fixturesByGroup)) {
    for (const fixture of fixtures) {
      const { id, matchday, homeTeam, awayTeam, date, time, venue, city } = fixture;

      operations.push({
        replaceOne: {
          filter: { _id: id },
          replacement: {
            _id: id,
            group,
            matchday,
            homeTeam,
            awayTeam,
            date,
            time,
            venue,
            city,
          },
          upsert: true,
        },
      });
    }
  }

  return operations;
}

function buildResultDocs(data) {
  const updatedAt = data.lastUpdated ? new Date(data.lastUpdated) : new Date();

  return Object.entries(data.matches ?? {}).map(([id, result]) => {
    const { homeScore, awayScore, goals, cards } = result;

    return {
      replaceOne: {
        filter: { _id: id },
        replacement: {
          _id: id,
          homeScore,
          awayScore,
          ...(goals?.length ? { goals } : {}),
          ...(cards?.length ? { cards } : {}),
          updatedAt,
        },
        upsert: true,
      },
    };
  });
}

function buildSquadDocs(data) {
  return Object.entries(data.squads ?? {}).map(([teamId, squad]) => {
    const { coach, captain, playerIds } = squad;

    return {
      replaceOne: {
        filter: { _id: teamId },
        replacement: { _id: teamId, coach, captain, playerIds },
        upsert: true,
      },
    };
  });
}

function buildPlayerDocs(data) {
  const flatPlayers = flattenPlayers(data);

  return Object.entries(flatPlayers).map(([id, player]) => {
    const {
      teamId,
      flagCode,
      name,
      position,
      shirtNumber,
      club,
      dateOfBirth,
      age,
      heightCm,
      foot,
      caps,
      internationalGoals,
      wcAppearances,
      wcGoals,
      worldCups,
      imageUrl,
    } = player;

    return {
      replaceOne: {
        filter: { _id: id },
        replacement: {
          _id: id,
          teamId,
          flagCode,
          name,
          position,
          ...(shirtNumber != null ? { shirtNumber } : {}),
          ...(club ? { club } : {}),
          ...(dateOfBirth ? { dateOfBirth } : {}),
          ...(age != null ? { age } : {}),
          ...(heightCm != null ? { heightCm } : {}),
          ...(foot ? { foot } : {}),
          ...(caps != null ? { caps } : {}),
          ...(internationalGoals != null ? { internationalGoals } : {}),
          ...(wcAppearances != null ? { wcAppearances } : {}),
          ...(wcGoals != null ? { wcGoals } : {}),
          ...(worldCups?.length ? { worldCups } : {}),
          ...(imageUrl ? { imageUrl } : {}),
        },
        upsert: true,
      },
    };
  });
}

function buildWcHistoryDocs(data) {
  return Object.entries(data.teams ?? {}).map(([teamId, history]) => {
    const { championships, bestFinish, appearances, tournaments } = history;

    return {
      replaceOne: {
        filter: { _id: teamId },
        replacement: { _id: teamId, championships, bestFinish, appearances, tournaments },
        upsert: true,
      },
    };
  });
}

const COLLECTIONS = {
  teams: {
    file: 'teams.json',
    collection: 'teams',
    build: (data) => buildTeamDocs(data),
    transform: (data) => data,
  },
  fixtures: {
    file: 'fixtures.json',
    collection: 'fixtures',
    build: (data) => buildFixtureDocs(data),
    transform: (data) => data,
  },
  results: {
    file: 'results.json',
    collection: 'results',
    build: (data) => buildResultDocs(data),
    transform: (data) => data,
  },
  squads: {
    file: 'squads.json',
    collection: 'squads',
    build: (data) => buildSquadDocs(data),
    transform: (data) => data,
  },
  players: {
    file: 'players.json',
    collection: 'players',
    build: (data) => buildPlayerDocs(data),
    transform: (data) => data,
  },
  wcHistory: {
    file: 'wcHistory.json',
    collection: 'wcHistory',
    build: (data) => buildWcHistoryDocs(data),
    transform: (data) => data,
  },
};

async function seedCollection(db, key, dataDir) {
  const config = COLLECTIONS[key];
  const raw = readJson(dataDir, config.file);
  const data = config.transform(raw);
  const operations = config.build(data);
  const collection = db.collection(config.collection);
  const touched = await bulkUpsert(collection, operations);

  return {
    key,
    collection: config.collection,
    file: config.file,
    documents: operations.length,
    touched,
  };
}

module.exports = {
  loadEnv,
  COLLECTIONS,
  seedCollection,
};
