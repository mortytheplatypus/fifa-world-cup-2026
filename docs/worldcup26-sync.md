# WorldCup26 Results Sync

Automatic import of group-stage match results from [worldcup26.ir/get/games](https://worldcup26.ir/get/games) into this app's MongoDB-backed API.

This document is separate from the main [README.md](../README.md), which covers the static data format and manual editing workflow.

---

## Summary of changes

### Before

- Scores were edited by hand in `public/data/results.json`
- Changes were pushed to MongoDB with `node scripts/sync-mongodb.js`
- No external data source or automation

### After

- A fetch + transform pipeline pulls finished group-stage games from worldcup26.ir
- Scores and goal scorers are converted to the existing result schema
- Results are merged into `results.json` and upserted into MongoDB
- Manual CLI scripts and an hourly Vercel cron can run the sync

### Unchanged

- Frontend (`src/`) — still loads `/api/results` and merges scores into fixtures
- API handlers (`api/teams.js`, `api/fixtures.js`, `api/results.js`)
- Fixture ids (`A-1`, `B-2`, …) and team codes in `fixtures.json` / `teams.json`
- Manual editing of `results.json` + `npm run sync:db` still works

### Files added

| Path | Purpose |
|------|---------|
| `public/data/worldcup26-id-map.json` | Fixed map: worldcup26 game id `"1"`–`"72"` → fixture id |
| `api/lib/worldcup26/fetch.js` | HTTP fetch from worldcup26.ir |
| `api/lib/worldcup26/idMap.js` | O(1) lookup using the static id map |
| `api/lib/worldcup26/fixtures.js` | Kickoff times for the 3-hour post-match gate |
| `api/lib/worldcup26/parseScorers.js` | Parses worldcup26 scorer strings into `goals[]` |
| `api/lib/worldcup26/transform.js` | Filters and converts games to result objects |
| `api/lib/worldcup26/persist.js` | Writes `results.json` + MongoDB upserts |
| `api/lib/worldcup26/sync.js` | Orchestrates the full pipeline |
| `scripts/sync-results-worldcup26.js` | CLI entry point |
| `api/cron/sync-results.js` | Vercel cron handler |
| `src/__tests__/worldcup26.test.js` | Unit tests |

### Files modified

| Path | Change |
|------|--------|
| `package.json` | Added `sync:db`, `sync:results` scripts; Jest test path for `api/**/*.test.js` |
| `vercel.json` | Hourly cron at `/api/cron/sync-results` |
| `.env.example` | Added `CRON_SECRET` |

---

## Architecture

```
worldcup26.ir/get/games
        │
        ▼
api/lib/worldcup26/fetch.js
        │
        ▼
api/lib/worldcup26/transform.js   ← id map, scorer parsing, 3-hour gate
        │
        ▼
api/lib/worldcup26/persist.js     ← results.json + MongoDB
        │
        ▼
GET /api/results  →  React app (standings, fixture cards, etc.)
```

Manual runs: `scripts/sync-results-worldcup26.js`  
Automated runs: Vercel cron → `/api/cron/sync-results` (hourly)

Both paths always enforce the **3-hour post-kickoff gate**.

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `MONGODB_DB_NAME` | No | Database name (default: `fifa-world-cup-2026`) |
| `CRON_SECRET` | Cron only | Bearer token for the automated sync endpoint |

Copy `.env.example` to `.env` and fill in values locally.

---

## How to operate

### Preview (no writes)

```bash
node scripts/sync-results-worldcup26.js --dry-run
```

Shows which matches would sync under the same rules as a real run (including the 3-hour gate).

### Sync results

```bash
npm run sync:results
```

Imports finished group-stage matches only when **kickoff + 3 hours** has passed (based on `fixtures.json` venue times). This applies to manual runs and cron alike — there is no bypass.

### Push hand-edited JSON to MongoDB

```bash
npm run sync:db
```

Same as before — upserts everything in `results.json` into MongoDB.

### Automated sync (Vercel cron)

Configured in `vercel.json`:

```json
{
  "path": "/api/cron/sync-results",
  "schedule": "0 * * * *"
}
```

1. Set `CRON_SECRET` and `MONGODB_URI` in Vercel env vars
2. Deploy

**Manual trigger:**

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-app.vercel.app/api/cron/sync-results
```

---

## What gets synced

Every sync (manual or cron) imports a game only when **all** of these are true:

| Condition | Required |
|-----------|----------|
| `finished === "TRUE"` on worldcup26 | Yes |
| `type === "group"` | Yes |
| Id in `worldcup26-id-map.json` | Yes |
| Kickoff + 3 hours ≤ now | Yes |

**Out of scope:** Knockout matches (worldcup26 ids 73–104) and unfinished games.

---

## Fixture id mapping

worldcup26 numeric ids do not match your `{group}-{n}` fixture order. A static map in `public/data/worldcup26-id-map.json` resolves this at sync time — no team-name comparison.

Examples:

| worldcup26 id | Fixture |
|---------------|---------|
| 1 | A-1 |
| 5 | C-2 |
| 7 | C-1 |
| 72 | K-6 |

If worldcup26 renumbers games, update that file.

---

## Result data shape

```json
{
  "_id": "A-1",
  "homeScore": 2,
  "awayScore": 0,
  "goals": [
    { "minute": 9, "scorer": "J. Quiñones", "team": "home" },
    { "minute": 67, "scorer": "R. Jiménez", "team": "home" }
  ],
  "updatedAt": "2026-06-14T09:16:20.846Z"
}
```

Scorer parsing examples:

- `"D. Bobadilla 7'(OG)"` → `(OG) D. Bobadilla` at minute 7
- `"Breel Embolo 17' (p)"` → `Breel Embolo (P)` at minute 17
- `"45'+5'"` → stoppage minute `"45+5"`

worldcup26 is the source of truth on sync; a manual edit to one fixture will be overwritten on the next sync for that match.

---

## Fallback if cron fails

There is **no automatic retry or alert** beyond the next hourly run.

| Situation | Action |
|-----------|--------|
| Cron missed an hour | Wait for next run, or run `npm run sync:results` locally |
| After each matchday | Run `npm run sync:results` once kickoff + 3 hours has passed |
| Cron returns 401/500 | Check Vercel logs; verify `CRON_SECRET` and `MONGODB_URI` |
| Site shows stale scores | MongoDB still has old data — run manual sync |

While cron is down, the site serves whatever is already in MongoDB.

---

## Recovery if data goes wrong

Sync and `sync:db` **upsert only** — they never delete MongoDB documents.

### Re-fetch from worldcup26 (preferred)

```bash
npm run sync:results
```

Rebuilds eligible finished group-stage results from the external source (respects the 3-hour gate).

### Restore from git + push to MongoDB

```bash
git checkout <good-commit> -- public/data/results.json
npm run sync:db
```

### Full reset

1. Clear the `results` collection in MongoDB (Atlas UI or mongosh)
2. Run `npm run sync:results` once matches are past kickoff + 3 hours

### Fix one bad fixture

Edit `public/data/results.json`, then `npm run sync:db`.

### JSON vs Mongo out of sync

`persist.js` writes `results.json` first, then upserts Mongo one fixture at a time. If Mongo fails mid-run, re-run:

```bash
npm run sync:db
```

---

## Verification

```bash
node scripts/sync-results-worldcup26.js --dry-run
npm test -- --watchAll=false --testPathPattern=worldcup26
curl https://your-host/api/results
```

The frontend caches API data for 1 hour (`src/utils/data.js`). Hard-refresh after sync to see updates immediately.

---

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run sync:results` | Fetch + sync (always uses 3-hour gate) |
| `npm run sync:db` | Push local JSON files to MongoDB |

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `MONGODB_URI is not set` | Add to `.env` or hosting env |
| `CRON_SECRET is not set` | Set in Vercel env vars |
| `401 Unauthorized` on cron | Bearer token must match `CRON_SECRET` |
| No matches synced | Wait for kickoff + 3 hours and `finished: TRUE` on worldcup26 |
| `Failed to fetch games` | worldcup26.ir unreachable — retry later |
| Missing scorers | worldcup26 source incomplete — edit JSON manually if needed |
