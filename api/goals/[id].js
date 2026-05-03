import { getDb, init, setupCors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (await setupCors(req, res)) return;
  await init();
  const db = getDb();
  const { id } = req.query;

  if (req.method === 'PUT') {
    const cur = await db.execute({ sql: 'SELECT * FROM goals WHERE id = ?', args: [id] });
    if (!cur.rows.length) return res.status(404).json({ error: 'not found' });
    const g = cur.rows[0];
    const { name, description, emoji, color, unit, target_value, deadline } = req.body || {};
    const r = await db.execute({
      sql: 'UPDATE goals SET name=?, description=?, emoji=?, color=?, unit=?, target_value=?, deadline=? WHERE id=? RETURNING *',
      args: [
        name ?? g.name, description ?? g.description, emoji ?? g.emoji, color ?? g.color,
        unit ?? g.unit, target_value ?? g.target_value,
        deadline !== undefined ? deadline : g.deadline, id,
      ],
    });
    const t = await db.execute({ sql: 'SELECT COALESCE(SUM(value),0) as total FROM goal_entries WHERE goal_id = ?', args: [id] });
    return res.json({ ...r.rows[0], logged_value: Number(t.rows[0].total) });
  }

  if (req.method === 'DELETE') {
    await db.execute({ sql: 'UPDATE goals SET active = 0 WHERE id = ?', args: [id] });
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'method not allowed' });
}
