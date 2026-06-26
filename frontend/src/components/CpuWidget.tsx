import ProgressBar from './ProgressBar';
import { cardStyle, labelStyle, bigStyle, subStyle, numStyle, tempColor } from './widgetStyles';

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
      <div style={labelStyle}>{name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1vmin' }}>
        <span style={bigStyle}>CPU</span>
        <div style={{ textAlign: 'right' }}>
          {freqMHz > 0 && <div style={subStyle}>&#9650; {freqGHz}</div>}
          {tempC > 0 && (
            <div style={{ ...subStyle, color: tempColor(tempC) }}>&#127777; {tempC}°C</div>
          )}
        </div>
      </div>
      <ProgressBar percent={usagePercent} />
      <div style={numStyle}>{usagePercent}%</div>
    </div>
  );
}
