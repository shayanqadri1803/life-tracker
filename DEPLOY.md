# Deployment Guide

Push to GitHub, then deploy via Vercel's GitHub integration. Total time: ~10 minutes.

---

## Step 1 — Create a Turso database

1. Sign up at https://turso.tech (free tier is plenty for personal use)
2. Install the CLI (one-time):
   ```bash
   curl -sSfL https://get.tur.so/install.sh | bash
   turso auth login
   ```
3. Create a database:
   ```bash
   turso db create life-tracker
   ```
4. Get the connection details — **save these, you'll paste them into Vercel later**:
   ```bash
   turso db show life-tracker --url       # → libsql://life-tracker-<you>.turso.io
   turso db tokens create life-tracker    # → eyJhbG...
   ```

---

## Step 2 — Push to GitHub

1. Create a new **empty** repo on GitHub: https://github.com/new
   (No README, no .gitignore — we already have them)
2. From the project folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/life-tracker.git
   git push -u origin main
   ```

---

## Step 3 — Deploy on Vercel

1. Go to https://vercel.com → **Add New… → Project**
2. Import the GitHub repo you just created
3. Vercel auto-detects Vite — leave all build settings as default
4. Expand **Environment Variables** and add:
   - `TURSO_DATABASE_URL` = your Turso URL from Step 1
   - `TURSO_AUTH_TOKEN` = your Turso token from Step 1
5. Click **Deploy**

Done. You'll get a URL like `life-tracker-<hash>.vercel.app`.

---

## After deployment

- **Auto-deploys**: every `git push` to `main` triggers a new deploy
- **Custom domain**: Vercel → Project → Settings → Domains
- **Mobile install**: open the URL in Safari/Chrome on your phone → Share → Add to Home Screen (works as a PWA-like app)
- **First load** is slow (cold start of serverless function + DB schema init). Subsequent loads are fast.

## Troubleshooting

- **API returns 500**: check Vercel → Project → Logs. Most likely missing or wrong `TURSO_*` env vars.
- **Empty data after deploy**: the seed runs on first request. Open the app once to trigger it.
- **Want to reset data**: `turso db shell life-tracker` then `DELETE FROM habits; DELETE FROM goals;` and restart.
