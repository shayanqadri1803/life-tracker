import { getDb, init, setupCors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (await setupCors(req, res)) return;
  await init();
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const habitsR = await db.execute("SELECT * FROM habits WHERE active = 1 ORDER BY id ASC");
  const habits = await Promise.all(habitsR.rows.map(async h => {
    const e = await db.execute({ sql: 'SELECT completed FROM habit_entries WHERE habit_id = ? AND date = ?', args: [h.id, today] });
    return { ...h, completed: e.rows[0]?.completed === 1 };
  }));

  const goalsR = await db.execute("SELECT * FROM goals WHERE active = 1 ORDER BY id ASC");
  const goals = await Promise.all(goalsR.rows.map(async g => {
    const t = await db.execute({ sql: 'SELECT COALESCE(SUM(value),0) as total FROM goal_entries WHERE goal_id = ?', args: [g.id] });
    const today_entries = await db.execute({ sql: 'SELECT * FROM goal_entries WHERE goal_id = ? AND date = ? ORDER BY id DESC', args: [g.id, today] });
    return { ...g, logged_value: Number(t.rows[0].total), today_entries: today_entries.rows };
  }));

  res.json({ date: today, habits, goals });
}
