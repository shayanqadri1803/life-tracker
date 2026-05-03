import { getDb, init, setupCors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (await setupCors(req, res)) return;
  await init();
  const db = getDb();
  const { id } = req.query;

  if (req.method === 'PUT') {
    const cur = await db.execute({ sql: 'SELECT * FROM habits WHERE id = ?', args: [id] });
    if (!cur.rows.length) return res.status(404).json({ error: 'not found' });
    const h = cur.rows[0];
    const { name, description, emoji, color } = req.body || {};
    const r = await db.execute({
      sql: 'UPDATE habits SET name=?, description=?, emoji=?, color=? WHERE id=? RETURNING *',
      args: [name ?? h.name, description ?? h.description, emoji ?? h.emoji, color ?? h.color, id],
    });
    return res.json(r.rows[0]);
  }

  if (req.method === 'DELETE') {
    await db.execute({ sql: 'UPDATE habits SET active = 0 WHERE id = ?', args: [id] });
    return res.json({ ok: true });
  }

  res.status(405).json({ error: 'method not allowed' });
}
