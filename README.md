# PopChoice (Movie Mania) — Vercel-ready (Online + Offline)

This app recommends movies from a curated list. It works **without** an OpenAI key (offline heuristic) and automatically upgrades to **AI-powered** reasons/embeddings if `OPENAI_API_KEY` is set.

## Local Dev
```bash
npm install
npm run dev           # Frontend at http://localhost:5173 (proxy /api -> 8787)
npm run dev:server    # Optional local API for development (server/index.js)
```
> On Vercel, API is served by serverless functions in `api/`.

## Deploy to Vercel
1. Push this folder to GitHub and import in Vercel.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. (Optional) Add `OPENAI_API_KEY` in Project → Settings → Environment Variables to enable AI mode.

## Notes
- `/api/recommend`: returns `best` movie with `reason`, plus `alternatives`.
- `/api/health`: simple health check (`offline: true` if no key).
- Local server (`server/index.js`) remains for convenience; Vercel uses `api/`.
