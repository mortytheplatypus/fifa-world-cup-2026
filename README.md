# Match data format

Static JSON files in this folder drive the site. To update scores and points tables after a match, edit **`results.json`** only.

## Files

| File | Purpose | Update during tournament? |
|------|---------|---------------------------|
| `groups.json` | Teams, group assignments, flag codes | No |
| `fixtures.json` | Schedule (date, time, venue, teams) | No |
| `results.json` | Match scores | **Yes — after each match** |

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

Both scores must be numbers. Omit a fixture from `matches` if it has not been played yet.

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

Team codes (`homeTeam`, `awayTeam`) match `id` values in `groups.json` (e.g. `MEX`, `RSA`).

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
| **Live** | Between kickoff and kickoff + 2 hours, no score |
| **FT** | `homeScore` and `awayScore` are set in `results.json` |
| **Awaiting result** | More than 2 hours after kickoff, no score yet |

Once you add scores to `results.json`, the match shows as **FT** even if still inside the 2-hour window.

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

## Future fields

The per-match object in `results.json` can be extended later without changing fixture ids, for example:

```json
"A-1": {
  "homeScore": 2,
  "awayScore": 1,
  "goals": [],
  "cards": [],
  "possession": { "home": 58, "away": 42 }
}
```

Only `homeScore` and `awayScore` are used today. Extra fields are ignored until match-detail UI is added.
