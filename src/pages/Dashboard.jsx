import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { getToday, getSummary, toggleHabit, logGoal } from '../api';
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
    const [d, s] = await Promise.all([getToday(), getSummary(today)]);
    setData(d);
    setSummary(s);
    setLoading(false);
  }, [today]);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (habit_id, completed) => {
    await toggleHabit(habit_id, today, completed);
    load();
  };

  const handleLog = async (goal_id, value, note) => {
    await logGoal(goal_id, today, value, note);
    load();
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
