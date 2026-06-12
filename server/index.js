const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors = require('cors');
const { getTeams, getFixtures, getResults } = require('../api/lib/handlers');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/teams', async (_req, res) => {
  try {
    res.json(await getTeams());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/fixtures', async (_req, res) => {
  try {
    res.json(await getFixtures());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/results', async (_req, res) => {
  try {
    res.json(await getResults());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
