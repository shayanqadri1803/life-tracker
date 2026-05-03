import { getDb, init, setupCors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (await setupCors(req, res)) return;
  await init();
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  // 4 queries in parallel — replaces N+1 pattern
  const [habitsR, entriesR, goalsR, sumsR, todayGoalsR] = await Promise.all([
    db.execute("SELECT * FROM habits WHERE active = 1 ORDER BY id ASC"),
    db.execute({ sql: "SELECT habit_id, completed FROM habit_entries WHERE date = ?", args: [today] }),
    db.execute("SELECT * FROM goals WHERE active = 1 ORDER BY id ASC"),
    db.execute("SELECT goal_id, COALESCE(SUM(value), 0) as total FROM goal_entries GROUP BY goal_id"),
    db.execute({ sql: "SELECT * FROM goal_entries WHERE date = ? ORDER BY id DESC", args: [today] }),
  ]);

  const completedMap = new Map(entriesR.rows.map(r => [Number(r.habit_id), r.completed === 1]));
  const totalsMap = new Map(sumsR.rows.map(r => [Number(r.goal_id), Number(r.total)]));
  const todayEntriesMap = new Map();
  for (const e of todayGoalsR.rows) {
    const arr = todayEntriesMap.get(Number(e.goal_id)) || [];
    arr.push(e);
    todayEntriesMap.set(Number(e.goal_id), arr);
  }

  const habits = habitsR.rows.map(h => ({ ...h, completed: completedMap.get(Number(h.id)) || false }));
  const goals = goalsR.rows.map(g => ({
    ...g,
    logged_value: totalsMap.get(Number(g.id)) || 0,
    today_entries: todayEntriesMap.get(Number(g.id)) || [],
  }));

  res.json({ date: today, habits, goals });
}
