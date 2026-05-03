export default function ProgressRing({ pct = 0, size = 96, stroke = 8, color = '#f97316' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e1e1e" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={pct === 100 ? '#22c55e' : color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{
          fontSize: size * 0.22, fontWeight: 800, lineHeight: 1,
          color: pct === 100 ? '#22c55e' : '#f1f1f1',
        }}>
          {pct}%
        </span>
        <span style={{ fontSize: 9, color: '#444', fontWeight: 700, letterSpacing: 0.5, marginTop: 2 }}>
          TODAY
        </span>
      </div>
    </div>
  );
}
