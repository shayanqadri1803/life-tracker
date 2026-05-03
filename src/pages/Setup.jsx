import { useState, useEffect } from 'react';
import { getHabits, createHabit, updateHabit, deleteHabit, getGoals, createGoal, updateGoal, deleteGoal } from '../api';

const COLORS = ['#f97316', '#fb923c', '#fdba74', '#f59e0b', '#ef4444', '#10b981', '#06b6d4', '#a855f7'];
const EMOJIS = ['✅', '🏃', '📚', '🧘', '💧', '🍎', '💪', '😴', '🎯', '🏅', '📖', '🧠', '🎸', '✍️', '🚴', '🌿'];

function ColorPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {COLORS.map(c => (
        <div
          key={c}
          onClick={() => onChange(c)}
          style={{
            width: 24, height: 24, borderRadius: 6, background: c, cursor: 'pointer',
            border: value === c ? '2px solid #fff' : '2px solid transparent',
            transition: 'transform 0.1s', transform: value === c ? 'scale(1.2)' : 'scale(1)'
          }}
        />
      ))}
    </div>
  );
}

function EmojiPicker({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {EMOJIS.map(e => (
        <button
          key={e}
          onClick={() => onChange(e)}
          style={{
            background: value === e ? '#2a2a2a' : 'transparent',
            border: value === e ? '1px solid #f97316' : '1px solid transparent',
            borderRadius: 8, padding: '4px 6px', cursor: 'pointer', fontSize: 18,
          }}
        >
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
    <div style={{ padding: '12px 0', borderTop: '1px solid #2a2a2a' }}>
      <input
        placeholder="Habit name *"
        value={form.name}
        onChange={e => set('name', e.target.value)}
        className="input"
        autoFocus
      />
      <input
        placeholder="Description (optional)"
        value={form.description}
        onChange={e => set('description', e.target.value)}
        className="input"
        style={{ marginTop: 8 }}
      />
      <div style={{ marginTop: 10 }}>
        <div className="label">Emoji</div>
        <EmojiPicker value={form.emoji} onChange={v => set('emoji', v)} />
      </div>
      <div style={{ marginTop: 10 }}>
        <div className="label">Color</div>
        <ColorPicker value={form.color} onChange={v => set('color', v)} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button className="btn-primary" onClick={() => form.name && onSave(form)}>
          {initial ? 'Save Changes' : 'Add Habit'}
        </button>
        <button className="btn-secondary" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function GoalForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name: '', description: '', emoji: '🎯', color: '#10b981', unit: '', target_value: '', deadline: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={{ padding: '12px 0', borderTop: '1px solid #2a2a2a' }}>
      <input placeholder="Goal name *" value={form.name} onChange={e => set('name', e.target.value)} className="input" autoFocus />
      <input placeholder="Description (optional)" value={form.description} onChange={e => set('description', e.target.value)} className="input" style={{ marginTop: 8 }} />
      <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
        <input placeholder="Target (e.g. 50)" type="number" value={form.target_value} onChange={e => set('target_value', e.target.value)} className="input" style={{ flex: 1 }} />
        <input placeholder="Unit (miles, books…)" value={form.unit} onChange={e => set('unit', e.target.value)} className="input" style={{ flex: 1 }} />
      </div>
      <input type="date" value={form.deadline || ''} onChange={e => set('deadline', e.target.value || null)} className="input" style={{ marginTop: 8 }} />
      <div style={{ marginTop: 10 }}>
        <div className="label">Emoji</div>
        <EmojiPicker value={form.emoji} onChange={v => set('emoji', v)} />
      </div>
      <div style={{ marginTop: 10 }}>
        <div className="label">Color</div>
        <ColorPicker value={form.color} onChange={v => set('color', v)} />
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        <button className="btn-primary" onClick={() => form.name && form.target_value && onSave(form)}>
          {initial ? 'Save Changes' : 'Add Goal'}
        </button>
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
    setHabits(h);
    setGoals(g);
  };

  useEffect(() => { load(); }, []);

  const handleSaveHabit = async (form) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, form);
      setEditingHabit(null);
    } else {
      await createHabit(form);
      setAddingHabit(false);
    }
    load();
  };

  const handleDeleteHabit = async (id) => {
    if (confirm('Delete this habit? All its history will be removed.')) {
      await deleteHabit(id);
      load();
    }
  };

  const handleSaveGoal = async (form) => {
    const payload = { ...form, target_value: parseFloat(form.target_value) };
    if (editingGoal) {
      await updateGoal(editingGoal.id, payload);
      setEditingGoal(null);
    } else {
      await createGoal(payload);
      setAddingGoal(false);
    }
    load();
  };

  const handleDeleteGoal = async (id) => {
    if (confirm('Delete this goal?')) {
      await deleteGoal(id);
      load();
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#f9fafb' }}>Setup</div>
          <div style={{ fontSize: 13, color: '#6b7280' }}>Manage your habits and goals</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['habits', 'goals'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: 14, transition: 'all 0.2s',
              background: tab === t ? '#f97316' : '#1a1a1a',
              color: tab === t ? '#fff' : '#9ca3af',
            }}
          >
            {t === 'habits' ? `🔁 Habits (${habits.length})` : `🎯 Goals (${goals.length})`}
          </button>
        ))}
      </div>

      {tab === 'habits' && (
        <div className="card">
          {habits.map(h => (
            <div key={h.id} style={{ marginBottom: 8 }}>
              {editingHabit?.id === h.id ? (
                <HabitForm initial={editingHabit} onSave={handleSaveHabit} onCancel={() => setEditingHabit(null)} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #1f1f1f' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: h.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 18 }}>{h.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f9fafb' }}>{h.name}</div>
                    {h.description && <div style={{ fontSize: 12, color: '#6b7280' }}>{h.description}</div>}
                  </div>
                  <button className="btn-icon" onClick={() => setEditingHabit(h)} title="Edit">✏️</button>
                  <button className="btn-icon" onClick={() => handleDeleteHabit(h.id)} title="Delete">🗑️</button>
                </div>
              )}
            </div>
          ))}

          {addingHabit ? (
            <HabitForm onSave={handleSaveHabit} onCancel={() => setAddingHabit(false)} />
          ) : (
            <button className="btn-add" onClick={() => setAddingHabit(true)}>+ Add Habit</button>
          )}
        </div>
      )}

      {tab === 'goals' && (
        <div className="card">
          {goals.map(g => (
            <div key={g.id} style={{ marginBottom: 8 }}>
              {editingGoal?.id === g.id ? (
                <GoalForm initial={{ ...editingGoal, target_value: String(editingGoal.target_value) }} onSave={handleSaveGoal} onCancel={() => setEditingGoal(null)} />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #1f1f1f' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: g.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 18 }}>{g.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#f9fafb' }}>{g.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>Target: {g.target_value} {g.unit}</div>
                  </div>
                  <button className="btn-icon" onClick={() => setEditingGoal(g)} title="Edit">✏️</button>
                  <button className="btn-icon" onClick={() => handleDeleteGoal(g.id)} title="Delete">🗑️</button>
                </div>
              )}
            </div>
          ))}

          {addingGoal ? (
            <GoalForm onSave={handleSaveGoal} onCancel={() => setAddingGoal(false)} />
          ) : (
            <button className="btn-add" onClick={() => setAddingGoal(true)}>+ Add Goal</button>
          )}
        </div>
      )}
    </div>
  );
}
