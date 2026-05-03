import { getDb, init, setupCors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (await setupCors(req, res)) return;
  await init();
  const db = getDb();
  const days = parseInt(req.query.days) || 30;

  const habitsR = await db.execute("SELECT * FROM habits WHERE active = 1 ORDER BY id ASC");
  const habits = habitsR.rows;

  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  const result = await Promise.all(habits.map(async h => {
    const entriesR = await db.execute({
      sql: `SELECT date, completed FROM habit_entries WHERE habit_id = ? AND date >= ?`,
      args: [h.id, dates[0]],
    });
    const map = new Map(entriesR.rows.map(r => [r.date, r.completed === 1]));
    return {
      ...h,
      history: dates.map(d => ({ date: d, completed: map.get(d) || false })),
    };
  }));

  res.json({ dates, habits: result });
}
