import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { getHistory } from '../api';

function DotRow({ habit, dates }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 8 }}>
      <div style={{ width: 130, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 14 }}>{habit.emoji}</span>
        <span style={{ fontSize: 12, color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{habit.name}</span>
      </div>
      <div style={{ display: 'flex', gap: 3, flex: 1, overflowX: 'auto' }}>
        {habit.history.map(entry => (
          <div
            key={entry.date}
            title={format(parseISO(entry.date), 'MMM d')}
            style={{
              width: 14, height: 14, borderRadius: 3, flexShrink: 0,
              background: entry.completed ? habit.color : '#2a2a2a',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function History() {
  const [data, setData] = useState(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    getHistory(days).then(setData);
  }, [days]);

  if (!data) return <div className="loading">Loading...</div>;

  const lastDates = data.dates.slice(-7);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb' }}>History</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Track your consistency over time</div>
        </div>
        <select
          value={days}
          onChange={e => setDays(Number(e.target.value))}
          style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 8, color: '#f9fafb', padding: '6px 10px', fontSize: 13 }}
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
        </select>
      </div>

      {data.habits.length === 0 ? (
        <div className="empty-state">No habits tracked yet.</div>
      ) : (
        <>
          <div className="card">
            <div className="section-title" style={{ marginBottom: 12 }}>Habit Heatmap</div>
            <div style={{ display: 'flex', marginBottom: 8, paddingLeft: 130 }}>
              {data.dates.slice(-Math.min(days, 14)).map((d, i) => (
                <div key={i} style={{ width: 14, flexShrink: 0, marginRight: 3, fontSize: 9, color: '#6b7280', textAlign: 'center', transform: 'rotate(-45deg)', transformOrigin: 'bottom' }}>
                  {format(parseISO(d), 'd')}
                </div>
              ))}
            </div>
            {data.habits.map(h => {
              const sliced = { ...h, history: h.history.slice(-Math.min(days, 30)) };
              return <DotRow key={h.id} habit={sliced} dates={data.dates} />;
            })}
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="section-title" style={{ marginBottom: 12 }}>Last 7 Days Detail</div>
            {lastDates.map(date => {
              const done = data.habits.filter(h => h.history.find(e => e.date === date && e.completed)).length;
              const pct = data.habits.length > 0 ? Math.round((done / data.habits.length) * 100) : 0;
              return (
                <div key={date} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>
                    <span>{format(parseISO(date), 'EEE, MMM d')}</span>
                    <span style={{ color: pct === 100 ? '#10b981' : pct > 50 ? '#f97316' : '#f87171' }}>{done}/{data.habits.length} · {pct}%</span>
                  </div>
                  <div style={{ background: '#2a2a2a', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: pct === 100 ? '#10b981' : '#f97316', borderRadius: 4, transition: 'width 0.4s' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
