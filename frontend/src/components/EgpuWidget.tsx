import UsageBar from './UsageBar';
import { cardStyle, labelStyle, bigStyle, subStyle, tempTopStyle, tempColor } from './widgetStyles';

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
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.2vmin', minWidth: 0 }}>
        {tempC > 0 && <span style={{ ...tempTopStyle, color: tempColor(tempC, 70, 83) }}>{tempC}°C</span>}
        <span style={{ ...labelStyle, marginBottom: 0, flex: 1, textAlign: 'right' }}>{shortName || 'eGPU'}</span>
        <span style={{ fontSize: 'var(--fs-label)', color: '#76b900', fontWeight: 700, flexShrink: 0 }}>OCULINK</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1vmin' }}>
        <span style={{ ...bigStyle, color: '#76b900' }}>eGPU</span>
        <div style={{ display: 'flex', gap: '1.4vmin' }}>
          {powerW > 0 && <span style={subStyle}>{powerW}W</span>}
          {vramTotalMB > 0 && <span style={subStyle}>{vramStr}</span>}
        </div>
      </div>
      <UsageBar percent={busyPercent} />
    </div>
  );
}
