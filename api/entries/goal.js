import { getDb, init, setupCors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (await setupCors(req, res)) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });
  await init();
  const db = getDb();

  const { goal_id, date, value, note = '' } = req.body || {};
  if (!goal_id || !date || value == null) return res.status(400).json({ error: 'goal_id, date, value required' });

  await db.execute({
    sql: 'INSERT INTO goal_entries (goal_id, date, value, note) VALUES (?, ?, ?, ?)',
    args: [goal_id, date, value, note],
  });
  const t = await db.execute({ sql: 'SELECT COALESCE(SUM(value),0) as total FROM goal_entries WHERE goal_id = ?', args: [goal_id] });
  res.json({ ok: true, total: Number(t.rows[0].total) });
}
