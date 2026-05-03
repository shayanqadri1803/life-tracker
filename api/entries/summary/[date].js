import { getDb, init, setupCors } from '../../_lib/db.js';

export default async function handler(req, res) {
  if (await setupCors(req, res)) return;
  await init();
  const db = getDb();
  const { date } = req.query;

  // Compute date range: today and 365 days back (for streak), or just last 7 days (for needs_work)
  const start = new Date(date);
  start.setDate(start.getDate() - 365);
  const startDate = start.toISOString().split('T')[0];

  const [habitsR, entriesR, goalsR, sumsR] = await Promise.all([
    db.execute("SELECT * FROM habits WHERE active = 1"),
    db.execute({
      sql: "SELECT habit_id, date, completed FROM habit_entries WHERE date >= ? AND date <= ? AND completed = 1",
      args: [startDate, date],
    }),
    db.execute("SELECT * FROM goals WHERE active = 1"),
    db.execute("SELECT goal_id, COALESCE(SUM(value), 0) as total FROM goal_entries GROUP BY goal_id"),
  ]);

  const habits = habitsR.rows;
  const totalHabits = habits.length;

  // Build a Set of "habitId|date" for O(1) lookups
  const doneSet = new Set(entriesR.rows.map(r => `${r.habit_id}|${r.date}`));
  const isDone = (habitId, d) => doneSet.has(`${habitId}|${d}`);

  // Today's stats
  let habits_done = 0;
  for (const h of habits) if (isDone(h.id, date)) habits_done++;
  const completion_pct = totalHabits ? Math.round((habits_done / totalHabits) * 100) : 0;

  // Streak: walk back day-by-day, all in memory
  let streak = 0;
  if (totalHabits > 0) {
    for (let i = 0; i < 365; i++) {
      const d = new Date(date);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      let done = 0;
      for (const h of habits) if (isDone(h.id, ds)) done++;
      if (done === totalHabits) streak++;
      else break;
    }
  }

  // Needs work: < 50% completion in last 7 days
  const needs_work = [];
  for (const h of habits) {
    let days_done = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(date);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      if (isDone(h.id, ds)) days_done++;
    }
    if (days_done / 7 < 0.5) needs_work.push({ ...h, days_done });
  }

  // Goals with totals
  const totalsMap = new Map(sumsR.rows.map(r => [Number(r.goal_id), Number(r.total)]));
  const goals = goalsR.rows.map(g => {
    const total = totalsMap.get(Number(g.id)) || 0;
    return {
      ...g,
      logged_value: total,
      pct: Math.min(100, Math.round((total / g.target_value) * 100)),
    };
  });

  res.json({
    date,
    habits_total: totalHabits,
    habits_done,
    completion_pct,
    streak,
    needs_work,
    goals,
  });
}
