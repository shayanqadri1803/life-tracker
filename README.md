# Life Tracker

A personal habit and goal tracker — dark theme with orange highlights, fully responsive (laptop + mobile).

- **Frontend**: React + Vite
- **Backend**: Vercel serverless functions (`/api`)
- **Database**: Turso (libSQL) — SQLite-compatible cloud DB

## Local development

```bash
npm install
cp .env.example .env.local   # leave URL blank to use ./local.db
npm install -g vercel        # one-time, needed for vercel dev
vercel dev                   # serves frontend + API on http://localhost:3000
```

`vercel dev` is needed locally because the frontend and `/api` routes are unified — plain `vite dev` only serves the frontend.

## Deploy

See [DEPLOY.md](DEPLOY.md) for full step-by-step guide (Turso + GitHub + Vercel).

## Features

- **Today** — toggle daily habits, log goal progress, see day completion %, streak, and "needs work" analysis
- **History** — 30-day heatmap of habit completion + 7-day breakdown
- **Setup** — add/edit/delete habits and goals with emoji and color pickers

## Project structure

```
/
├── api/                # Vercel serverless functions
│   ├── _lib/db.js     # libSQL client + schema init + seed
│   ├── habits/
│   ├── goals/
│   └── entries/       # today, habit toggle, goal log, summary, history
├── src/                # React frontend
│   ├── pages/         # Dashboard, History, Setup
│   └── components/    # HabitCard, GoalCard, ProgressBar, DaySummary
├── package.json
├── vercel.json
└── vite.config.js
```
