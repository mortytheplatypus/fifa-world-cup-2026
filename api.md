# API

Read-only serverless routes on Vercel (`/api/*`). Local dev uses the same paths via `vercel dev`.

## Vercel deploy

1. Connect the repo to Vercel.
2. Set environment variables in the Vercel dashboard:
   - `MONGODB_URI`
   - `MONGODB_DB_NAME` (optional, default: `fifa-world-cup-2026`)
3. Deploy — CRA builds to `build/`, `/api/*` runs as serverless functions.

No `REACT_APP_API_URL` needed in production (frontend uses relative `/api/...` on the same domain).

## Local development

Copy `.env.example` to `.env.local` in the project root and set `MONGODB_URI`.

```bash
npm install
npx vercel dev
```

This runs the React app and `/api/*` serverless functions together, matching production.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
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
