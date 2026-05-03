import { getDb, init, setupCors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (await setupCors(req, res)) return;
  await init();
  const db = getDb();

  if (req.method === 'GET') {
    const r = await db.execute("SELECT * FROM habits WHERE active = 1 ORDER BY id ASC");
    return res.json(r.rows);
  }

  if (req.method === 'POST') {
    const { name, description = '', emoji = '✅', color = '#f97316' } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name required' });
    const r = await db.execute({
      sql: 'INSERT INTO habits (name, description, emoji, color) VALUES (?, ?, ?, ?) RETURNING *',
      args: [name, description, emoji, color],
    });
    return res.json(r.rows[0]);
  }

  res.status(405).json({ error: 'method not allowed' });
}
