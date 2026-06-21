import ProgressBar from './ProgressBar';

interface Props {
  usagePercent: number;
  freqMHz: number;
  tempC: number;
}

export default function CpuWidget({ usagePercent, freqMHz, tempC }: Props) {
  const freqGHz = freqMHz > 0 ? (freqMHz / 1000).toFixed(1) + 'GHz' : '—';
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>Ryzen 9 8845HS</div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>CPU</span>
        <div style={{ textAlign: 'right' }}>
          {freqMHz > 0 && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>&#9650; {freqGHz}</div>}
          {tempC > 0 && (
            <div style={{ fontSize: 11, color: tempC > 85 ? 'var(--red)' : tempC > 70 ? 'var(--orange)' : 'var(--text-secondary)' }}>
              &#127777; {tempC}°C
            </div>
          )}
        </div>
      </div>
      <ProgressBar percent={usagePercent} />
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, textAlign: 'right' }}>{usagePercent}%</div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'var(--card)',
  border: '1px solid var(--card-border)',
  borderRadius: 'var(--radius)',
  padding: '10px 12px',
  display: 'flex',
  flexDirection: 'column',
};
