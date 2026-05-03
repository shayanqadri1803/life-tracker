import { useState } from 'react';
import ProgressBar from './ProgressBar';

export default function GoalCard({ goal, onLog }) {
  const [logging, setLogging] = useState(false);
  const [input, setInput] = useState('');
  const [note, setNote] = useState('');

  const { id, name, emoji, color, unit, target_value, logged_value } = goal;
  const pct = Math.min(100, target_value > 0 ? Math.round((logged_value / target_value) * 100) : 0);

  const handleLog = () => {
    const v = parseFloat(input);
    if (!isNaN(v) && v > 0) {
      onLog(id, v, note);
      setInput('');
      setNote('');
      setLogging(false);
    }
  };

  return (
    <div className="card" style={{ borderLeft: `3px solid ${color}` }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 20 }}>{emoji}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 15, color: '#f9fafb' }}>{name}</div>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
            {logged_value} / {target_value} {unit}
          </div>
        </div>
        <span style={{
          fontSize: 13, fontWeight: 700, color: pct >= 100 ? '#10b981' : color,
          background: pct >= 100 ? '#10b98122' : `${color}22`,
          padding: '2px 10px', borderRadius: 12
        }}>
          {pct}%
        </span>
      </div>
      <ProgressBar value={logged_value} max={target_value} color={color} height={6} />
      {!logging ? (
        <button
          onClick={() => setLogging(true)}
          style={{
            marginTop: 10, background: 'transparent', border: `1px solid ${color}`,
            color: color, borderRadius: 8, padding: '5px 12px', cursor: 'pointer',
            fontSize: 12, fontWeight: 600
          }}
        >
          + Log Progress
        </button>
      ) : (
        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            type="number"
            placeholder={`Amount (${unit || 'value'})`}
            value={input}
            onChange={e => setInput(e.target.value)}
            style={{
              flex: 1, minWidth: 100, background: '#1a1a1a', border: '1px solid #333',
              borderRadius: 8, padding: '6px 10px', color: '#f9fafb', fontSize: 13
            }}
            autoFocus
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{
              flex: 2, minWidth: 120, background: '#1a1a1a', border: '1px solid #333',
              borderRadius: 8, padding: '6px 10px', color: '#f9fafb', fontSize: 13
            }}
          />
          <button onClick={handleLog} style={{ background: color, border: 'none', borderRadius: 8, padding: '6px 14px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>Save</button>
          <button onClick={() => setLogging(false)} style={{ background: '#2a2a2a', border: 'none', borderRadius: 8, padding: '6px 10px', color: '#9ca3af', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
        </div>
      )}
    </div>
  );
}
