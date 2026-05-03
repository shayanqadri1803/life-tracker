import { useState, useEffect } from 'react';
import { getHistory, getStats } from '../api';
import WeekChart from '../components/WeekChart';

export default function Stats() {
  const [history, setHistory] = useState(null);
  const [stats, setStats] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    Promise.all([getHistory(days), getStats()]).then(([h, s]) => {
      setHistory(h);
      setStats(s);
    });
  }, [days]);

  if (!history || !stats) return <div className="loading">Loading stats…</div>;

  const weeklyData = history.dates.slice(-7).map((date, i) => {
    const done = history.habits.filter(h => h.history.find(e => e.date === date && e.completed)).length;
    const pct = history.habits.length > 0 ? Math.round((done / history.habits.length) * 100) : 0;
    const d = new Date(date);
    const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return { date, label: DAYS[d.getDay()], pct, isToday: i === 6 };
  });

  return (
    <div className="page">
      <div className="page-header-block">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div className="page-header-title">Stats</div>
            <div className="page-header-sub">Your consistency over time</div>
          </div>
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            style={{
              background: 'var(--surface2)', border: '1px solid var(--border2)',
              borderRadius: 'var(--radius-sm)', color: 'var(--text)', padding: '7px 10px',
              fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            }}
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
          </select>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>
        {/* Stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}
             className="stat-tiles-grid">
          <div className="stat-tile accent">
            <div className="stat-tile-icon">🔥</div>
            <div className="stat-tile-val">{stats.best_streak}<small>d</small></div>
            <div className="stat-tile-lbl">Best Streak</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-icon">✅</div>
            <div className="stat-tile-val">{stats.avg_30day_pct}<small>%</small></div>
            <div className="stat-tile-lbl">Avg (30 days)</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-icon">⚡</div>
            <div className="stat-tile-val">{stats.total_checkins}</div>
            <div className="stat-tile-lbl">Total Check-ins</div>
          </div>
          <div className="stat-tile">
            <div className="stat-tile-icon">🎯</div>
            <div className="stat-tile-val">{history.habits.length}</div>
            <div className="stat-tile-lbl">Active Habits</div>
          </div>
        </div>

        {/* Weekly bar chart */}
        <div className="section-title">This Week</div>
        <div className="card" style={{ marginBottom: 16 }}>
          <WeekChart weekly={weeklyData} />
        </div>

        {/* Heatmap */}
        {history.habits.length > 0 && (
          <>
            <div className="section-title">Habit Heatmap</div>
            <div className="card" style={{ marginBottom: 16 }}>
              {history.habits.map(h => {
                const slice = h.history.slice(-days);
                return (
                  <div key={h.id} className="heatmap-row">
                    <span className="heatmap-label">{h.emoji}</span>
                    <div className="heatmap-dots">
                      {slice.map(entry => (
                        <div
                          key={entry.date}
                          className={`heatmap-dot${entry.completed ? ' done' : ''}`}
                          title={entry.date}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>Less</span>
                {['var(--border2)', 'rgba(249,115,22,0.25)', 'rgba(249,115,22,0.6)', 'var(--orange)'].map((c, i) => (
                  <div key={i} style={{ width: 12, height: 12, borderRadius: 3, background: c }} />
                ))}
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>More</span>
              </div>
            </div>
          </>
        )}

        {/* Last 7 days breakdown */}
        <div className="section-title">Last 7 Days</div>
        <div className="card">
          {weeklyData.map(d => (
            <div key={d.date} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                <span style={{ color: d.isToday ? 'var(--orange)' : 'var(--text2)', fontWeight: d.isToday ? 700 : 500 }}>
                  {d.isToday ? 'Today' : d.date}
                </span>
                <span style={{ color: d.pct === 100 ? 'var(--green)' : d.pct >= 50 ? 'var(--orange)' : 'var(--red)', fontWeight: 700 }}>
                  {d.pct}%
                </span>
              </div>
              <div style={{ background: 'var(--border2)', borderRadius: 4, height: 5, overflow: 'hidden' }}>
                <div style={{
                  width: `${d.pct}%`, height: '100%', borderRadius: 4,
                  background: d.pct === 100 ? 'var(--green)' : 'var(--orange)',
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
