import { getDb, init, setupCors } from '../_lib/db.js';

export default async function handler(req, res) {
  if (await setupCors(req, res)) return;
  await init();
  const db = getDb();
  const today = new Date().toISOString().split('T')[0];

  // Date range for streak/needs_work computation (last 365 days)
  const start = new Date(today);
  start.setDate(start.getDate() - 365);
  const startDate = start.toISOString().split('T')[0];

  // 5 queries in parallel — covers both today snapshot AND summary stats
  const [habitsR, allEntriesR, goalsR, sumsR, todayGoalEntriesR] = await Promise.all([
    db.execute("SELECT * FROM habits WHERE active = 1 ORDER BY id ASC"),
    db.execute({
      sql: "SELECT habit_id, date FROM habit_entries WHERE date >= ? AND date <= ? AND completed = 1",
      args: [startDate, today],
    }),
    db.execute("SELECT * FROM goals WHERE active = 1 ORDER BY id ASC"),
    db.execute("SELECT goal_id, COALESCE(SUM(value), 0) as total FROM goal_entries GROUP BY goal_id"),
    db.execute({ sql: "SELECT * FROM goal_entries WHERE date = ? ORDER BY id DESC", args: [today] }),
  ]);

  const habits = habitsR.rows;
  const totalHabits = habits.length;

  // Build O(1) lookup: "habitId|date" → done
  const doneSet = new Set(allEntriesR.rows.map(r => `${r.habit_id}|${r.date}`));
  const isDone = (habitId, d) => doneSet.has(`${habitId}|${d}`);

  // Today snapshot
  const habitsOut = habits.map(h => ({ ...h, completed: isDone(h.id, today) }));

  const totalsMap = new Map(sumsR.rows.map(r => [Number(r.goal_id), Number(r.total)]));
  const todayEntriesMap = new Map();
  for (const e of todayGoalEntriesR.rows) {
    const arr = todayEntriesMap.get(Number(e.goal_id)) || [];
    arr.push(e);
    todayEntriesMap.set(Number(e.goal_id), arr);
  }
  const goalsOut = goalsR.rows.map(g => ({
    ...g,
    logged_value: totalsMap.get(Number(g.id)) || 0,
    today_entries: todayEntriesMap.get(Number(g.id)) || [],
  }));

  // Summary stats
  const habits_done = habitsOut.filter(h => h.completed).length;
  const completion_pct = totalHabits ? Math.round((habits_done / totalHabits) * 100) : 0;

  let streak = 0;
  if (totalHabits > 0) {
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      let done = 0;
      for (const h of habits) if (isDone(h.id, ds)) done++;
      if (done === totalHabits) streak++;
      else break;
    }
  }

  const needs_work = [];
  for (const h of habits) {
    let days_done = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      if (isDone(h.id, ds)) days_done++;
    }
    if (days_done / 7 < 0.5) needs_work.push({ ...h, days_done });
  }

  const goalsSummary = goalsOut.map(g => ({
    ...g,
    pct: Math.min(100, Math.round((g.logged_value / g.target_value) * 100)),
  }));

  res.json({
    date: today,
    habits: habitsOut,
    goals: goalsOut,
    summary: {
      date: today,
      habits_total: totalHabits,
      habits_done,
      completion_pct,
      streak,
      needs_work,
      goals: goalsSummary,
    },
  });
}
