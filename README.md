# Match data format

Static JSON files in this folder drive the site. To update scores and points tables after a match, edit **`results.json`** only.

## Files

| File | Purpose | Update during tournament? | MongoDB collection |
|------|---------|---------------------------|--------------------|
| `teams.json` | Teams, groups, flag codes, theme colors, FIFA ranking | Rarely (pre-tournament snapshot) | `teams` |
| `fixtures.json` | Schedule (date, time, venue, teams) | No | `fixtures` |
| `results.json` | Match scores | **Yes — after each match** | `results` |

After editing any of these files, push changes to MongoDB:

```bash
npm run seed:db
```

Requires `MONGODB_URI` (and optionally `MONGODB_DB_NAME`) in `.env`. The live API reads from MongoDB, not the JSON files directly.

## Updating results

Edit `results.json` and add or update an entry under `matches`, keyed by **fixture id**.

```json
{
  "lastUpdated": "2026-06-11T21:00:00Z",
  "matches": {
    "A-1": {
      "homeScore": 2,
      "awayScore": 1
    },
    "A-2": {
      "homeScore": 1,
      "awayScore": 1
    }
  }
}
```

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `lastUpdated` | Optional | ISO 8601 timestamp for your own reference (not used by the app) |
| `matches` | Yes | Object mapping fixture id → result |
| `matches[id].homeScore` | Yes | Goals scored by the home team |
| `matches[id].awayScore` | Yes | Goals scored by the away team |
| `matches[id].goals` | Optional | Goal scorers for match detail UI |
| `matches[id].cards` | Optional | Discipline events for tie-breakers (see below) |

Both scores must be numbers. Omit a fixture from `matches` if it has not been played yet.

### Cards (`results.json`)

Add a `cards` array when you have discipline data. Each entry applies to one booking in that match:

```json
"H-2": {
  "homeScore": 1,
  "awayScore": 1,
  "cards": [
    { "team": "home", "type": "yellow" }
  ]
}
```

| `type` | Conduct deduction |
|--------|-------------------|
| `yellow` | −1 |
| `secondYellow` | −3 |
| `directRed` | −4 |
| `yellowAndDirectRed` | −5 |

`team` is `"home"` or `"away"`. The team with the **higher** conduct score ranks above teams with more deductions.

### Fixture ids

Ids live in `fixtures.json`, one per match. Pattern: `{group}-{matchNumber}`.

```json
{
  "id": "A-1",
  "matchday": 1,
  "homeTeam": "MEX",
  "awayTeam": "RSA",
  "date": "2026-06-11",
  "time": "13:00",
  "venue": "Mexico City Stadium",
  "city": "Mexico City"
}
```

- **Group A, first match** → `A-1`
- **Group B, third match** → `B-3`

Team codes (`homeTeam`, `awayTeam`) match `id` values in `teams.json` (e.g. `MEX`, `RSA`).

### Team fields (`teams.json`)

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Three-letter team code |
| `name` | Yes | Full team name |
| `group` | Yes | Group letter (`A`–`L`) |
| `flagCode` | Yes | ISO code for flagcdn.com |
| `colors` | Optional | Theme colors for UI |
| `fifaRankingPreWc` | Yes | June 11 2026 FIFA/Coca-Cola Men's World Ranking position before the tournament (lower is better). Used for group-stage tie-breakers. |

## Points table tie-breakers

When teams are level on points, standings follow FIFA group-stage rules in order:

1. Head-to-head points, then goal difference, then goals scored among tied teams
2. Repeat head-to-head criteria for any remaining tied subsets, then overall goal difference, overall goals scored, and team conduct (fair play)
3. FIFA world ranking (June 2026 edition), then team code as a final fallback

Team conduct is calculated from `cards` in `results.json` (see below). Matches without card data contribute 0 to conduct.

## What updates automatically

When the app loads, scores from `results.json` are merged into the schedule. No changes to `fixtures.json` are needed for results.

- **Fixture cards** show the score and an **FT** badge
- **Points tables** recalculate (played, W/D/L, goals, GD, points)
- **Home page** “Latest results” includes completed matches

## Match status labels

Status is derived from kickoff time and whether a score exists in `results.json`:

| Label | When |
|-------|------|
| **Upcoming** | Kickoff is in the future, no score |
| **Live** | Between kickoff and kickoff + 2.5 hours, no score |
| **FT** | `homeScore` and `awayScore` are set in `results.json` |
| **Awaiting result** | More than 2.5 hours after kickoff, no score yet |

Once you add scores to `results.json`, the match shows as **FT** even if still inside the 2.5-hour window.

## Example workflow

1. Find the fixture id in `fixtures.json` (e.g. `C-2`).
2. Open `results.json`.
3. Add the result:

   ```json
   "C-2": {
     "homeScore": 3,
     "awayScore": 0
   }
   ```

4. Optionally set `lastUpdated` to the current UTC time.
5. Save, rebuild/redeploy, or refresh in development.

## Optional match fields

The per-match object in `results.json` can include extra detail without changing fixture ids:

```json
"A-1": {
  "homeScore": 2,
  "awayScore": 1,
  "goals": [],
  "cards": [],
  "possession": { "home": 58, "away": 42 }
}
```

`homeScore`, `awayScore`, and `cards` affect points tables. Other fields are reserved for future match-detail UI.

## API

Read-only endpoints served at `/api/*`.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/teams` | All teams (includes `colors`, `fifaRankingPreWc`) |
| GET | `/api/fixtures` | Fixtures grouped by letter |
| GET | `/api/results` | Match results |
| GET | `/api/knockouts` | All knockout matches (schedule + results) |
| GET | `/api/knockouts/{matchId}` | Single knockout match (e.g. `M73`) |

### Examples

```bash
curl https://{vercel.host}/api/teams
curl https://{vercel.host}/api/fixtures
curl https://{vercel.host}/api/results
curl https://{vercel.host}/api/knockouts
curl https://{vercel.host}/api/knockouts/M73
```

## Knockout schedule mode

When the group stage ends, switch Home and Fixtures to knockout matches with a build-time env flag (redeploy after changing):

| Variable | Purpose |
|----------|---------|
| `REACT_APP_KNOCKOUT_SCHEDULE=true` | Home upcoming/latest/hero and Fixtures default tab use knockout matches (M73–M104) |

**Deploy-day checklist**

1. **MongoDB** — in the `knockouts` collection, set `time`, `city`, and `venue` on each match document. Status labels (Upcoming / Live / FT) depend on kickoff time; update `homeScore` / `awayScore` as matches finish.
2. **Env** — set `REACT_APP_KNOCKOUT_SCHEDULE=true` on your host.
3. **Redeploy** the app.
4. **Smoke test** — Home hero and upcoming/latest show knockout matches; Fixtures opens on the Knockout tab with a Group stage archive tab; `/knockout` bracket still works.
