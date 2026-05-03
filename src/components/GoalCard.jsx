import { useState } from 'react';

export default function GoalCard({ goal, onLog }) {
  const [logging, setLogging] = useState(false);
  const [input, setInput] = useState('');
  const [note, setNote] = useState('');

  const { id, name, emoji, unit, target_value, logged_value } = goal;
  const pct = Math.min(100, target_value > 0 ? Math.round((logged_value / target_value) * 100) : 0);
  const complete = pct >= 100;

  const handleLog = () => {
    const v = parseFloat(input);
    if (!isNaN(v) && v > 0) {
      onLog(id, v, note);
      setInput(''); setNote(''); setLogging(false);
    }
  };

  return (
    <div className="goal-card">
      <div className="goal-card-top">
        <div className="goal-emoji-box">{emoji}</div>
        <div className="goal-card-info">
          <div className="goal-card-name">{name}</div>
          <div className="goal-card-sub">{logged_value} / {target_value} {unit}</div>
        </div>
        <div className={`goal-pct-badge${complete ? ' complete' : ''}`}>{pct}%</div>
      </div>
      <div className="goal-prog-track">
        <div className="goal-prog-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="goal-log-area">
        {!logging ? (
          <button className="goal-log-btn" onClick={() => setLogging(true)}>+ Log Progress</button>
        ) : (
          <div className="goal-log-inputs">
            <input
              type="number"
              placeholder={`Amount (${unit || 'value'})`}
              value={input}
              onChange={e => setInput(e.target.value)}
              className="input"
              style={{ flex: 1, minWidth: 100 }}
              autoFocus
            />
            <input
              type="text"
              placeholder="Note (optional)"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="input"
              style={{ flex: 2, minWidth: 120 }}
            />
            <button className="btn-primary" onClick={handleLog}>Save</button>
            <button className="btn-secondary" onClick={() => setLogging(false)}>✕</button>
          </div>
        )}
      </div>
    </div>
  );
}
