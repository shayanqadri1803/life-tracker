export default function WeekChart({ weekly = [] }) {
  return (
    <div>
      <div className="week-chart">
        {weekly.map(d => (
          <div key={d.date} className="week-bar-col">
            <div className="week-bar-outer">
              <div
                className={`week-bar-inner${d.isToday ? ' today-bar' : ''}`}
                style={{ height: `${Math.max(4, d.pct)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {weekly.map(d => (
          <div key={d.date} style={{ flex: 1, textAlign: 'center' }}>
            <span className={`week-day-lbl${d.isToday ? ' today-lbl' : ''}`}>{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
