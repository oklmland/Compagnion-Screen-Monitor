import ProgressBar from './ProgressBar';

interface Props {
  name: string;
  busyPercent: number;
  vramUsedMB: number;
  vramTotalMB: number;
  tempC: number;
  powerW: number;
}

export default function EgpuWidget({ name, busyPercent, vramUsedMB, vramTotalMB, tempC, powerW }: Props) {
  const vramStr = vramTotalMB > 0
    ? `${(vramUsedMB / 1024).toFixed(1)}/${(vramTotalMB / 1024).toFixed(0)}G`
    : '—';
  // Nom court : "NVIDIA GeForce RTX 4070" -> "RTX 4070"
  const shortName = name.replace(/^NVIDIA\s+GeForce\s+/i, '').replace(/^NVIDIA\s+/i, '');
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{shortName || 'eGPU'}</span>
        <span style={{ fontSize: 9, color: '#76b900', fontWeight: 700 }}>OCULINK</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, color: '#76b900' }}>eGPU</span>
        <div style={{ textAlign: 'right' }}>
          {vramTotalMB > 0 && <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{vramStr}</div>}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            {powerW > 0 && <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{powerW}W</span>}
            {tempC > 0 && (
              <span style={{ fontSize: 11, color: tempC > 83 ? 'var(--red)' : tempC > 70 ? 'var(--orange)' : 'var(--text-secondary)' }}>
                &#127777; {tempC}°C
              </span>
            )}
          </div>
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
