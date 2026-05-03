import ProgressBar from './ProgressBar';

export default function DaySummary({ summary }) {
  if (!summary) return null;
  const { habits_done, habits_total, completion_pct, streak, needs_work, goals } = summary;
  const allDone = habits_done === habits_total && habits_total > 0;

  return (
    <div className="card" style={{ borderLeft: '3px solid #f97316' }}>
      <div style={{ fontWeight: 700, fontSize: 16, color: '#f9fafb', marginBottom: 12 }}>
        📊 Day Summary
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: `conic-gradient(#f97316 ${completion_pct * 3.6}deg, #2a2a2a 0deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: '50%', background: '#111',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: '#f97316'
          }}>
            {completion_pct}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: 14, color: '#f9fafb', fontWeight: 600 }}>
            {habits_done} of {habits_total} habits done
          </div>
          {streak > 0 && (
            <div style={{ fontSize: 12, color: '#f59e0b', marginTop: 3 }}>
              🔥 {streak} day streak
            </div>
          )}
          {allDone && <div style={{ fontSize: 12, color: '#10b981', marginTop: 3 }}>✨ Perfect day!</div>}
        </div>
      </div>

      {needs_work.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#f87171', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Needs Work (last 7 days)
          </div>
          {needs_work.map(h => (
            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 14 }}>{h.emoji}</span>
              <span style={{ flex: 1, fontSize: 13, color: '#d1d5db' }}>{h.name}</span>
              <span style={{ fontSize: 11, color: '#f87171' }}>{h.days_done}/7 days</span>
            </div>
          ))}
        </div>
      )}

      {needs_work.length === 0 && habits_total > 0 && (
        <div style={{ fontSize: 13, color: '#10b981', marginBottom: 12 }}>
          🎯 Great consistency across all habits this week!
        </div>
      )}

      {goals.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Goal Progress
          </div>
          {goals.map(g => (
            <div key={g.id} style={{ marginBottom: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#d1d5db', marginBottom: 4 }}>
                <span>{g.emoji} {g.name}</span>
                <span style={{ color: g.pct >= 100 ? '#10b981' : '#9ca3af' }}>{g.pct}%</span>
              </div>
              <ProgressBar value={g.logged_value} max={g.target_value} color={g.color} height={5} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
