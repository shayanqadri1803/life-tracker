export default function ProgressBar({ value, max = 100, color = '#f97316', height = 8, showLabel = false }) {
  const pct = Math.min(100, max > 0 ? Math.round((value / max) * 100) : 0);
  return (
    <div style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12, color: '#9ca3af' }}>
          <span>{value} / {max}</span>
          <span>{pct}%</span>
        </div>
      )}
      <div style={{ background: '#2a2a2a', borderRadius: height, height, overflow: 'hidden', width: '100%' }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: color,
            borderRadius: height,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  );
}
