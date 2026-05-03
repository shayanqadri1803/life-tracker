import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { getToday, toggleHabit, logGoal } from '../api';
import HabitCard from '../components/HabitCard';
import GoalCard from '../components/GoalCard';
import DaySummary from '../components/DaySummary';
import ProgressBar from '../components/ProgressBar';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  const load = useCallback(async () => {
    const d = await getToday();
    setData({ date: d.date, habits: d.habits, goals: d.goals });
    setSummary(d.summary);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Optimistic toggle: update UI immediately, sync to server in background
  const handleToggle = (habit_id, completed) => {
    setData(prev => ({
      ...prev,
      habits: prev.habits.map(h => h.id === habit_id ? { ...h, completed } : h),
    }));
    toggleHabit(habit_id, today, completed)
      .then(() => load())     // re-sync summary (streak, needs_work, %)
      .catch(() => load());   // on error, refetch authoritative state
  };

  // Optimistic goal log: bump logged_value immediately
  const handleLog = (goal_id, value, note) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.map(g => g.id === goal_id ? { ...g, logged_value: g.logged_value + value } : g),
    }));
    logGoal(goal_id, today, value, note)
      .then(() => load())
      .catch(() => load());
  };

  if (loading) return <div className="loading">Loading...</div>;

  const doneCount = data.habits.filter(h => h.completed).length;
  const total = data.habits.length;
  const pct = total > 0 ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>Today</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb' }}>
            {format(new Date(), 'EEEE, MMMM d')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: pct === 100 ? '#10b981' : '#f97316' }}>{pct}%</div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>{doneCount}/{total} habits</div>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <ProgressBar value={doneCount} max={total || 1} color={pct === 100 ? '#10b981' : '#f97316'} height={10} />
      </div>

      {data.habits.length > 0 ? (
        <section style={{ marginBottom: 24 }}>
          <div className="section-title">Daily Habits</div>
          {data.habits.map(h => (
            <HabitCard key={h.id} habit={h} onToggle={handleToggle} />
          ))}
        </section>
      ) : (
        <div className="empty-state">
          No habits yet. <a href="/setup" style={{ color: '#f97316' }}>Add some in Setup →</a>
        </div>
      )}

      {data.goals.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <div className="section-title">Goals</div>
          {data.goals.map(g => (
            <GoalCard key={g.id} goal={g} onLog={handleLog} />
          ))}
        </section>
      )}

      <DaySummary summary={summary} />
    </div>
  );
}
