import UsageBar from './UsageBar';
import { cardStyle, labelStyle, bigStyle, subStyle, tempTopStyle, tempColor } from './widgetStyles';

interface Props {
  name: string;
  usagePercent: number;
  freqMHz: number;
  tempC: number;
}

export default function CpuWidget({ name, usagePercent, freqMHz, tempC }: Props) {
  const freqGHz = freqMHz > 0 ? (freqMHz / 1000).toFixed(1) + 'GHz' : '—';
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.2vmin', minWidth: 0 }}>
        {tempC > 0 && <span style={{ ...tempTopStyle, color: tempColor(tempC) }}>{tempC}°C</span>}
        <span style={{ ...labelStyle, marginBottom: 0, flex: 1, textAlign: 'right' }}>{name}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1vmin' }}>
        <span style={bigStyle}>CPU</span>
        {freqMHz > 0 && <span style={subStyle}>&#9650; {freqGHz}</span>}
      </div>
      <UsageBar percent={usagePercent} />
    </div>
  );
}
