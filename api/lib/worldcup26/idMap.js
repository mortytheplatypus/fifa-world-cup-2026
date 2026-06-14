const fs = require('fs');
const path = require('path');

const ID_MAP_PATH = path.join(__dirname, '..', '..', '..', 'public', 'data', 'worldcup26-id-map.json');

let cachedMap = null;

function loadIdMap() {
  if (cachedMap) {
    return cachedMap;
  }

  cachedMap = JSON.parse(fs.readFileSync(ID_MAP_PATH, 'utf8'));
  return cachedMap;
}

function resolveFixtureId(gameId) {
  const map = loadIdMap();
  return map[String(gameId)] ?? null;
}

module.exports = { loadIdMap, resolveFixtureId };
