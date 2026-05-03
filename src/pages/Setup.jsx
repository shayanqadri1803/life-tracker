import { useState, useEffect } from 'react';
import { getHabits, createHabit, updateHabit, deleteHabit, getGoals, createGoal, updateGoal, deleteGoal } from '../api';

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#f59e0b', '#ef4444', '#10b981', '#06b6d4', '#a855f7'];
const EMOJIS = ['✅', '🏃', '📚', '🧘', '💧', '🍎', '💪', '😴', '🎯', '🏅', '📖', '🧠', '🎸', '✍️', '🚴', '🌿'];

function ColorPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {COLORS.map(c => (
        <div key={c} onClick={() => onChange(c)} style={{
          width: 26, height: 26, borderRadius: 8, background: c, cursor: 'pointer',
          border: value === c ? '2.5px solid #fff' : '2.5px solid transparent',
          transform: value === c ? 'scale(1.15)' : 'scale(1)',
          transition: 'transform 0.15s',
        }} />
      ))}
    </div>
  );
}

function EmojiPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
      {EMOJIS.map(e => (
        <button key={e} onClick={() => onChange(e)} style={{
          background: value === e ? 'var(--surface2)' : 'transparent',
          border: value === e ? '1px solid var(--orange)' : '1px solid transparent',
          borderRadius: 8, padding: '4px 5px', cursor: 'pointer', fontSize: 18,
        }}>
          {e}
        </button>
      ))}
    </div>
  );
}

function HabitForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name: '', description: '', emoji: '✅', color: '#f97316' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)', marginTop: 4 }}>
      <input placeholder="Habit name *" value={form.name} onChange={e => set('name', e.target.value)} className="input" autoFocus />
      <input placeholder="Description (optional)" value={form.description} onChange={e => set('description', e.target.value)} className="input" style={{ marginTop: 8 }} />
      <div style={{ marginTop: 12 }}><div className="label">Emoji</div><EmojiPicker value={form.emoji} onChange={v => set('emoji', v)} /></div>
      <div style={{ marginTop: 12 }}><div className="label">Color</div><ColorPicker value={form.color} onChange={v => set('color', v)} /></div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button className="btn-primary" onClick={() => form.name && onSave(form)}>{initial ? 'Save' : 'Add Habit'}</button>
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function GoalForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name: '', description: '', emoji: '🎯', color: '#f97316', unit: '', target_value: '', deadline: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div style={{ paddingTop: 14, borderTop: '1px solid var(--border)', marginTop: 4 }}>
      <input placeholder="Goal name *" value={form.name} onChange={e => set('name', e.target.value)} className="input" autoFocus />
      <input placeholder="Description (optional)" value={form.description} onChange={e => set('description', e.target.value)} className="input" style={{ marginTop: 8 }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input placeholder="Target *" type="number" value={form.target_value} onChange={e => set('target_value', e.target.value)} className="input" style={{ flex: 1 }} />
        <input placeholder="Unit (miles, books…)" value={form.unit} onChange={e => set('unit', e.target.value)} className="input" style={{ flex: 1 }} />
      </div>
      <input type="date" value={form.deadline || ''} onChange={e => set('deadline', e.target.value || null)} className="input" style={{ marginTop: 8 }} />
      <div style={{ marginTop: 12 }}><div className="label">Emoji</div><EmojiPicker value={form.emoji} onChange={v => set('emoji', v)} /></div>
      <div style={{ marginTop: 12 }}><div className="label">Color</div><ColorPicker value={form.color} onChange={v => set('color', v)} /></div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button className="btn-primary" onClick={() => form.name && form.target_value && onSave(form)}>{initial ? 'Save' : 'Add Goal'}</button>
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export default function Setup() {
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [editingHabit, setEditingHabit] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [addingHabit, setAddingHabit] = useState(false);
  const [addingGoal, setAddingGoal] = useState(false);
  const [tab, setTab] = useState('habits');

  const load = async () => {
    const [h, g] = await Promise.all([getHabits(), getGoals()]);
    setHabits(h); setGoals(g);
  };
  useEffect(() => { load(); }, []);

  const handleSaveHabit = async (form) => {
    if (editingHabit) { await updateHabit(editingHabit.id, form); setEditingHabit(null); }
    else { await createHabit(form); setAddingHabit(false); }
    load();
  };
  const handleDeleteHabit = async (id) => {
    if (confirm('Delete this habit? Its history will be removed.')) { await deleteHabit(id); load(); }
  };
  const handleSaveGoal = async (form) => {
    const payload = { ...form, target_value: parseFloat(form.target_value) };
    if (editingGoal) { await updateGoal(editingGoal.id, payload); setEditingGoal(null); }
    else { await createGoal(payload); setAddingGoal(false); }
    load();
  };
  const handleDeleteGoal = async (id) => {
    if (confirm('Delete this goal?')) { await deleteGoal(id); load(); }
  };

  return (
    <div className="page">
      <div className="page-header-block">
        <div className="page-header-title">Setup</div>
        <div className="page-header-sub">Manage your habits and goals</div>
      </div>

      <div style={{ padding: '0 16px' }}>
        <div className="seg-control">
          <button className={`seg-btn${tab === 'habits' ? ' active' : ''}`} onClick={() => setTab('habits')}>
            🔁 Habits ({habits.length})
          </button>
          <button className={`seg-btn${tab === 'goals' ? ' active' : ''}`} onClick={() => setTab('goals')}>
            🎯 Goals ({goals.length})
          </button>
        </div>

        {tab === 'habits' && (
          <div className="card">
            {habits.map(h => (
              <div key={h.id}>
                {editingHabit?.id === h.id ? (
                  <HabitForm initial={editingHabit} onSave={handleSaveHabit} onCancel={() => setEditingHabit(null)} />
                ) : (
                  <div className="setup-item">
                    <div className="setup-color-dot" style={{ background: h.color }} />
                    <span className="setup-emoji">{h.emoji}</span>
                    <div className="setup-info">
                      <div className="setup-name">{h.name}</div>
                      {h.description && <div className="setup-desc">{h.description}</div>}
                    </div>
                    <div className="setup-actions">
                      <button className="btn-icon" onClick={() => setEditingHabit(h)}>✏️</button>
                      <button className="btn-icon" onClick={() => handleDeleteHabit(h.id)}>🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {addingHabit
              ? <HabitForm onSave={handleSaveHabit} onCancel={() => setAddingHabit(false)} />
              : <button className="btn-add" onClick={() => setAddingHabit(true)}>+ Add Habit</button>
            }
          </div>
        )}

        {tab === 'goals' && (
          <div className="card">
            {goals.map(g => (
              <div key={g.id}>
                {editingGoal?.id === g.id ? (
                  <GoalForm
                    initial={{ ...editingGoal, target_value: String(editingGoal.target_value) }}
                    onSave={handleSaveGoal}
                    onCancel={() => setEditingGoal(null)}
                  />
                ) : (
                  <div className="setup-item">
                    <div className="setup-color-dot" style={{ background: g.color }} />
                    <span className="setup-emoji">{g.emoji}</span>
                    <div className="setup-info">
                      <div className="setup-name">{g.name}</div>
                      <div className="setup-desc">Target: {g.target_value} {g.unit}</div>
                    </div>
                    <div className="setup-actions">
                      <button className="btn-icon" onClick={() => setEditingGoal(g)}>✏️</button>
                      <button className="btn-icon" onClick={() => handleDeleteGoal(g.id)}>🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {addingGoal
              ? <GoalForm onSave={handleSaveGoal} onCancel={() => setAddingGoal(false)} />
              : <button className="btn-add" onClick={() => setAddingGoal(true)}>+ Add Goal</button>
            }
          </div>
        )}
      </div>
    </div>
  );
}
