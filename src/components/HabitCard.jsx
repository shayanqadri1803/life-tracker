import ProgressBar from './ProgressBar';

export default function HabitCard({ habit, onToggle }) {
  const { id, name, emoji, color, completed } = habit;

  return (
    <div
      className="card"
      style={{ borderLeft: `3px solid ${color}`, cursor: 'pointer' }}
      onClick={() => onToggle(id, !completed)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 28, height: 28, borderRadius: 8,
            border: `2px solid ${completed ? color : '#444'}`,
            background: completed ? color : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 0.2s ease',
          }}
        >
          {completed && <span style={{ fontSize: 14, color: '#fff' }}>✓</span>}
        </div>
        <span style={{ fontSize: 18 }}>{emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: 600, fontSize: 15,
            color: completed ? '#6b7280' : '#f9fafb',
            textDecoration: completed ? 'line-through' : 'none',
            transition: 'all 0.2s'
          }}>
            {name}
          </div>
        </div>
        {completed && (
          <span style={{ fontSize: 11, color: color, fontWeight: 600, background: `${color}22`, padding: '2px 8px', borderRadius: 12 }}>
            Done
          </span>
        )}
      </div>
    </div>
  );
}
