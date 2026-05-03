import { getDb, init, setupCors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (await setupCors(req, res)) return;
  await init();
  const db = getDb();

  if (req.method === 'GET') {
    const r = await db.execute("SELECT * FROM goals WHERE active = 1 ORDER BY id ASC");
    const goals = r.rows;
    const out = await Promise.all(goals.map(async g => {
      const t = await db.execute({ sql: 'SELECT COALESCE(SUM(value),0) as total FROM goal_entries WHERE goal_id = ?', args: [g.id] });
      return { ...g, logged_value: Number(t.rows[0].total) };
    }));
    return res.json(out);
  }

  if (req.method === 'POST') {
    const { name, description = '', emoji = '🎯', color = '#f97316', unit = '', target_value, deadline = null } = req.body || {};
    if (!name || target_value == null) return res.status(400).json({ error: 'name and target_value required' });
    const r = await db.execute({
      sql: 'INSERT INTO goals (name, description, emoji, color, unit, target_value, deadline) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *',
      args: [name, description, emoji, color, unit, target_value, deadline],
    });
    return res.json({ ...r.rows[0], logged_value: 0 });
  }

  res.status(405).json({ error: 'method not allowed' });
}
