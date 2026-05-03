import { getDb, init, setupCors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (await setupCors(req, res)) return;
  await init();
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  const start = new Date(today);
  start.setDate(start.getDate() - 365);
  const startDate = start.toISOString().split('T')[0];

  const [habitsR, allEntriesR, totalCheckinsR] = await Promise.all([
    db.execute("SELECT * FROM habits WHERE active = 1"),
    db.execute({ sql: "SELECT habit_id, date FROM habit_entries WHERE date >= ? AND completed = 1", args: [startDate] }),
    db.execute("SELECT COUNT(*) as total FROM habit_entries WHERE completed = 1"),
  ]);

  const habits = habitsR.rows;
  const totalHabits = habits.length;
  const doneSet = new Set(allEntriesR.rows.map(r => `${r.habit_id}|${r.date}`));
  const isDone = (habitId, d) => doneSet.has(`${habitId}|${d}`);

  // Best streak (walk back 365 days, track max consecutive all-done)
  let bestStreak = 0, curStreak = 0;
  if (totalHabits > 0) {
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      let done = 0;
      for (const h of habits) if (isDone(h.id, ds)) done++;
      if (done === totalHabits) { curStreak++; bestStreak = Math.max(bestStreak, curStreak); }
      else curStreak = 0;
    }
  }

  // 30-day average completion %
  let totalPct = 0;
  for (let i = 0; i < 30; i++) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const ds = d.toISOString().split('T')[0];
    let done = 0;
    for (const h of habits) if (isDone(h.id, ds)) done++;
    totalPct += totalHabits ? (done / totalHabits) * 100 : 0;
  }
  const avg_30day_pct = Math.round(totalPct / 30);

  // 30-day heatmap per habit
  const dates30 = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    dates30.push(d.toISOString().split('T')[0]);
  }

  const heatmap = habits.map(h => ({
    id: h.id, name: h.name, emoji: h.emoji, color: h.color,
    days: dates30.map(d => ({ date: d, done: isDone(h.id, d) })),
  }));

  res.json({
    total_checkins: Number(totalCheckinsR.rows[0].total),
    best_streak: bestStreak,
    avg_30day_pct,
    heatmap,
  });
}
