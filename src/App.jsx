import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Setup from './pages/Setup';
import './index.css';

function Nav() {
  const links = [
    { to: '/', label: 'Today', icon: '☀️' },
    { to: '/history', label: 'Stats', icon: '📊' },
    { to: '/setup', label: 'Setup', icon: '⚙️' },
  ];

  return (
    <>
      <nav className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌱</div>
          <span style={{ fontWeight: 800, fontSize: 15, color: 'var(--text)', letterSpacing: '-0.3px' }}>LifeTracker</span>
        </div>
        <div style={{ flex: 1 }}>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              <span style={{ fontSize: 17 }}>{l.icon}</span>
              <span>{l.label}</span>
            </NavLink>
          ))}
        </div>
        <div className="sidebar-footer">
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>Keep it up</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--orange)' }}>🔥 Stay consistent</div>
        </div>
      </nav>

      <nav className="bottom-nav">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
          >
            <span style={{ fontSize: 20 }}>{l.icon}</span>
            <span style={{ fontSize: 10 }}>{l.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <Nav />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/setup" element={<Setup />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
