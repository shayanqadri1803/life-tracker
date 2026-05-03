import { getDb, init, setupCors } from '../../_lib/db.js';

export default async function handler(req, res) {
  if (await setupCors(req, res)) return;
  await init();
  const db = getDb();
  const { date } = req.query;

  const habitsR = await db.execute("SELECT * FROM habits WHERE active = 1");
  const habits = habitsR.rows;

  async function isDone(habitId, d) {
    const r = await db.execute({ sql: 'SELECT completed FROM habit_entries WHERE habit_id = ? AND date = ?', args: [habitId, d] });
    return r.rows[0]?.completed === 1;
  }

  let habits_done = 0;
  for (const h of habits) if (await isDone(h.id, date)) habits_done++;
  const completion_pct = habits.length ? Math.round((habits_done / habits.length) * 100) : 0;

  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(date);
    d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    let done = 0;
    for (const h of habits) if (await isDone(h.id, ds)) done++;
    if (done === habits.length && habits.length > 0) streak++;
    else break;
  }

  const needs_work = [];
  for (const h of habits) {
    let days_done = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(date);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      if (await isDone(h.id, ds)) days_done++;
    }
    if (days_done / 7 < 0.5) needs_work.push({ ...h, days_done });
  }

  const goalsR = await db.execute("SELECT * FROM goals WHERE active = 1");
  const goals = await Promise.all(goalsR.rows.map(async g => {
    const t = await db.execute({ sql: 'SELECT COALESCE(SUM(value),0) as total FROM goal_entries WHERE goal_id = ?', args: [g.id] });
    const total = Number(t.rows[0].total);
    return { ...g, logged_value: total, pct: Math.min(100, Math.round((total / g.target_value) * 100)) };
  }));

  res.json({
    date,
    habits_total: habits.length,
    habits_done,
    completion_pct,
    streak,
    needs_work,
    goals,
  });
}
