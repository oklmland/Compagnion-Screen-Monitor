import ProgressBar from './ProgressBar';
import { cardStyle, labelStyle, bigStyle, subStyle, numStyle, tempColor } from './widgetStyles';

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1vmin' }}>
        <span style={{ ...labelStyle, marginBottom: 0 }}>{shortName || 'eGPU'}</span>
        <span style={{ fontSize: 'var(--fs-label)', color: '#76b900', fontWeight: 700 }}>OCULINK</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1vmin' }}>
        <span style={{ ...bigStyle, color: '#76b900' }}>eGPU</span>
        <div style={{ textAlign: 'right' }}>
          {vramTotalMB > 0 && <div style={subStyle}>{vramStr}</div>}
          <div style={{ display: 'flex', gap: '1.4vmin', justifyContent: 'flex-end' }}>
            {powerW > 0 && <span style={subStyle}>{powerW}W</span>}
            {tempC > 0 && (
              <span style={{ ...subStyle, color: tempColor(tempC, 70, 83) }}>&#127777; {tempC}°C</span>
            )}
          </div>
        </div>
      </div>
      <ProgressBar percent={busyPercent} />
      <div style={numStyle}>{busyPercent}%</div>
    </div>
  );
}
