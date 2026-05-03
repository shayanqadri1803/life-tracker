const BASE = '/api';

export const getToday = () => fetch(`${BASE}/entries/today`).then(r => r.json());
export const getSummary = (date) => fetch(`${BASE}/entries/summary/${date}`).then(r => r.json());
export const getHistory = (days = 30) => fetch(`${BASE}/entries/history?days=${days}`).then(r => r.json());
export const getStats = () => fetch(`${BASE}/entries/stats`).then(r => r.json());

export const toggleHabit = (habit_id, date, completed) =>
  fetch(`${BASE}/entries/habit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ habit_id, date, completed })
  }).then(r => r.json());

export const logGoal = (goal_id, date, value, note = '') =>
  fetch(`${BASE}/entries/goal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ goal_id, date, value, note })
  }).then(r => r.json());

export const getHabits = () => fetch(`${BASE}/habits`).then(r => r.json());
export const createHabit = (data) =>
  fetch(`${BASE}/habits`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
export const updateHabit = (id, data) =>
  fetch(`${BASE}/habits/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
export const deleteHabit = (id) =>
  fetch(`${BASE}/habits/${id}`, { method: 'DELETE' }).then(r => r.json());

export const getGoals = () => fetch(`${BASE}/goals`).then(r => r.json());
export const createGoal = (data) =>
  fetch(`${BASE}/goals`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
export const updateGoal = (id, data) =>
  fetch(`${BASE}/goals/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());
export const deleteGoal = (id) =>
  fetch(`${BASE}/goals/${id}`, { method: 'DELETE' }).then(r => r.json());
