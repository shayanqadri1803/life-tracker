import { getDb, init, setupCors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (await setupCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  await init();
  const db = getDb();

  const { habit_id, date, completed } = req.body || {};
  if (!habit_id || !date) return res.status(400).json({ error: 'habit_id and date required' });

  await db.execute({
    sql: `INSERT INTO habit_entries (habit_id, date, completed) VALUES (?, ?, ?)
          ON CONFLICT(habit_id, date) DO UPDATE SET completed = excluded.completed`,
    args: [habit_id, date, completed ? 1 : 0],
  });
  res.json({ ok: true });
}
