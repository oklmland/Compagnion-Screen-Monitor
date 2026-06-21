import ProgressBar from './ProgressBar';

interface Props {
  busyPercent: number;
  vramUsedMB: number;
  vramTotalMB: number;
  tempC: number;
}

export default function GpuWidget({ busyPercent, vramUsedMB, vramTotalMB, tempC }: Props) {
  const vramStr = vramTotalMB > 0
    ? `${(vramUsedMB / 1024).toFixed(1)}/${(vramTotalMB / 1024).toFixed(0)}G`
    : '—';
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2 }}>Radeon 780M</div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>GPU</span>
        <div style={{ textAlign: 'right' }}>
          {vramTotalMB > 0 && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{vramStr}</div>}
          {tempC > 0 && (
            <div style={{ fontSize: 11, color: tempC > 85 ? 'var(--red)' : tempC > 70 ? 'var(--orange)' : 'var(--text-secondary)' }}>
              &#127777; {tempC}°C
            </div>
          )}
        </div>
      </div>
      <ProgressBar percent={busyPercent} />
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, textAlign: 'right' }}>{busyPercent}%</div>
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
