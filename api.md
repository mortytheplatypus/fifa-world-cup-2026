# API

Read-only serverless routes on Vercel (`/api/*`). Local dev can use the same paths via `npm run api` or `vercel dev`.

## Vercel deploy

1. Connect the repo to Vercel.
2. Set environment variables in the Vercel dashboard:
   - `MONGODB_URI`
   - `MONGODB_DB_NAME` (optional, default: `fifa-world-cup-2026`)
3. Deploy — CRA builds to `build/`, `/api/*` runs as serverless functions.

No `REACT_APP_API_URL` needed in production (frontend uses relative `/api/...` on the same domain).

## Local development

Copy `.env.example` to `.env` in the project root and set `MONGODB_URI`.

**Option A — Vercel dev (matches production)**

```bash
npm install
npx vercel dev
```

**Option B — CRA + local API**

Terminal 1:

```bash
npm run api
```

Terminal 2:

```bash
npm start
```

`package.json` proxies `/api/*` to `http://localhost:8000`.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/teams` | All teams (includes `colors`) |
| GET | `/api/fixtures` | Fixtures grouped by letter |
| GET | `/api/results` | Match results |

---

## Health check

```bash
curl https://your-app.vercel.app/api/health
```

## Get teams

```bash
curl https://your-app.vercel.app/api/teams
```

## Get fixtures

```bash
curl https://your-app.vercel.app/api/fixtures
```

## Get results

```bash
curl https://your-app.vercel.app/api/results
```
