export default function HabitCard({ habit, onToggle }) {
  const { id, name, emoji, completed, week_pct = 0, habit_streak = 0 } = habit;

  return (
    <div
      className={`habit-card${completed ? ' done' : ''}`}
      onClick={() => onToggle(id, !completed)}
    >
      <div className={`habit-check${completed ? ' checked' : ''}`}>
        {completed && '✓'}
      </div>
      <span className="habit-emoji">{emoji}</span>
      <div className="habit-info">
        <div className={`habit-name${completed ? ' done' : ''}`}>{name}</div>
        <div className="habit-meta">
          {habit_streak > 0 ? `🔥 ${habit_streak} day streak` : 'No streak yet'}
        </div>
      </div>
      <div className="habit-right">
        <div className={`habit-week-pct${week_pct >= 70 ? ' high' : ''}`}>{week_pct}%</div>
        <div className="habit-week-bar">
          <div className="habit-week-bar-fill" style={{ width: `${week_pct}%` }} />
        </div>
      </div>
    </div>
  );
}
