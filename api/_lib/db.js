import { createClient } from '@libsql/client';

let client;
let initPromise;

export function getDb() {
  if (!client) {
    client = createClient({
      url: process.env.TURSO_DATABASE_URL || 'file:local.db',
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }
  return client;
}

export async function init() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    const db = getDb();
    // Fast path: tables already exist — skip schema work entirely
    try {
      await db.execute('SELECT 1 FROM habits LIMIT 1');
      return;
    } catch {
      // Table doesn't exist; fall through to full schema setup
    }
    const schema = [
      `CREATE TABLE IF NOT EXISTS habits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        emoji TEXT DEFAULT '✅',
        color TEXT DEFAULT '#f97316',
        active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (date('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        emoji TEXT DEFAULT '🎯',
        color TEXT DEFAULT '#f97316',
        unit TEXT DEFAULT '',
        target_value REAL NOT NULL,
        deadline TEXT,
        active INTEGER DEFAULT 1,
        created_at TEXT DEFAULT (date('now'))
      )`,
      `CREATE TABLE IF NOT EXISTS habit_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        completed INTEGER DEFAULT 0,
        UNIQUE(habit_id, date)
      )`,
      `CREATE TABLE IF NOT EXISTS goal_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        goal_id INTEGER NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
        date TEXT NOT NULL,
        value REAL NOT NULL,
        note TEXT DEFAULT ''
      )`,
    ];
    for (const sql of schema) await db.execute(sql);

    const r = await db.execute('SELECT COUNT(*) as c FROM habits');
    if (Number(r.rows[0].c) === 0) {
      const seeds = [
        { sql: 'INSERT INTO habits (name, description, emoji, color) VALUES (?, ?, ?, ?)', args: ['Morning Exercise', 'At least 20 minutes of movement', '🏃', '#f97316'] },
        { sql: 'INSERT INTO habits (name, description, emoji, color) VALUES (?, ?, ?, ?)', args: ['Read', 'Read for at least 30 minutes', '📚', '#fb923c'] },
        { sql: 'INSERT INTO habits (name, description, emoji, color) VALUES (?, ?, ?, ?)', args: ['Meditate', '10 minutes of mindfulness', '🧘', '#fdba74'] },
        { sql: 'INSERT INTO habits (name, description, emoji, color) VALUES (?, ?, ?, ?)', args: ['Drink Water', '8 glasses throughout the day', '💧', '#fed7aa'] },
        { sql: 'INSERT INTO goals (name, description, emoji, color, unit, target_value) VALUES (?, ?, ?, ?, ?, ?)', args: ['Run 50 miles', 'Monthly running goal', '🏅', '#f97316', 'miles', 50] },
        { sql: 'INSERT INTO goals (name, description, emoji, color, unit, target_value) VALUES (?, ?, ?, ?, ?, ?)', args: ['Read 5 books', 'Read more this month', '📖', '#fb923c', 'books', 5] },
      ];
      for (const s of seeds) await db.execute(s);
    }
  })();
  return initPromise;
}

export async function setupCors(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export function rowsToObjects(result) {
  return result.rows.map(row => {
    const obj = {};
    for (const col of result.columns) obj[col] = row[col];
    return obj;
  });
}
