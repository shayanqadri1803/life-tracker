import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { getToday, toggleHabit, logGoal } from '../api';
import ProgressRing from '../components/ProgressRing';
import HabitCard from '../components/HabitCard';
import GoalCard from '../components/GoalCard';
import WeekChart from '../components/WeekChart';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = new Date().toISOString().split('T')[0];

  const load = useCallback(async () => {
    const d = await getToday();
    setData(d);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = (habit_id, completed) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === habit_id ? { ...h, completed } : h),
    }));
    toggleHabit(habit_id, today, completed).then(() => load()).catch(() => load());
  };

  const handleLog = (goal_id, value, note) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === goal_id ? { ...g, logged_value: g.logged_value + value } : g),
    }));
    logGoal(goal_id, today, value, note).then(() => load()).catch(() => load());
  };

  if (loading) return <div className="loading">Loading your day…</div>;

  const { habits, goals, summary } = data;
  const { habits_done, habits_total, completion_pct, streak, needs_work, weekly = [] } = summary;
  const remaining = habits_total - habits_done;

  return (
    <div className="page">
      {/* Hero */}
      <div className="dash-hero">
        <div className="dash-greeting">Good {getGreeting()}</div>
        <div className="dash-date">{format(new Date(), 'EEEE, MMMM d')}</div>

        <div className="dash-ring-row">
          <ProgressRing pct={completion_pct} size={100} stroke={9} />
          <div className="dash-stats-right">
            <div className="dash-stat-item">
              <div className="dash-stat-val">{habits_done}<span>of {habits_total}</span></div>
              <div className="dash-stat-lbl">Habits done</div>
            </div>
            <div className="dash-stat-item">
              <div className="dash-stat-val" style={{ color: remaining === 0 ? '#22c55e' : undefined }}>
                {remaining}<span>{remaining === 1 ? 'left' : 'remaining'}</span>
              </div>
              <div className="dash-stat-lbl">{remaining === 0 ? 'Perfect day! 🎉' : 'Still to go'}</div>
            </div>
          </div>
        </div>

        {streak > 0 && (
          <div className="streak-pill">🔥 {streak} day streak — keep it up!</div>
        )}
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Habits */}
        {habits.length > 0 ? (
          <section style={{ marginBottom: 24 }}>
            <div className="section-title">Daily Habits</div>
            {habits.map(h => <HabitCard key={h.id} habit={h} onToggle={handleToggle} />)}
          </section>
        ) : (
          <div className="empty-state">
            No habits yet.<br />
            <a href="/setup" style={{ color: 'var(--orange)' }}>Set them up →</a>
          </div>
        )}

        {/* Goals */}
        {goals.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <div className="section-title">Goals</div>
            {goals.map(g => <GoalCard key={g.id} goal={g} onLog={handleLog} />)}
          </section>
        )}

        {/* Needs work */}
        {needs_work.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <div className="section-title">Needs Work</div>
            <div className="card">
              {needs_work.map(h => (
                <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 16 }}>{h.emoji}</span>
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text2)' }}>{h.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: h.week_pct < 30 ? 'var(--red)' : '#f59e0b' }}>{h.week_pct}% this week</span>
                </div>
              ))}
              <div style={{ paddingTop: 10, fontSize: 11, color: 'var(--text3)', lineHeight: 1.6 }}>
                These habits were completed less than 50% of days in the last 7 days.
              </div>
            </div>
          </section>
        )}

        {/* Weekly chart */}
        {weekly.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <div className="section-title">This Week</div>
            <div className="card">
              <WeekChart weekly={weekly} />
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
