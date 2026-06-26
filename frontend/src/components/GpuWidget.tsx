import ProgressBar from './ProgressBar';
import { cardStyle, labelStyle, bigStyle, subStyle, numStyle, tempColor } from './widgetStyles';

interface Props {
  name: string;
  busyPercent: number;
  vramUsedMB: number;
  vramTotalMB: number;
  tempC: number;
}

export default function GpuWidget({ name, busyPercent, vramUsedMB, vramTotalMB, tempC }: Props) {
  const vramStr = vramTotalMB > 0
    ? `${(vramUsedMB / 1024).toFixed(1)}/${(vramTotalMB / 1024).toFixed(0)}G`
    : '—';
  return (
    <div style={cardStyle}>
      <div style={labelStyle}>{name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1vmin' }}>
        <span style={bigStyle}>GPU</span>
        <div style={{ textAlign: 'right' }}>
          {vramTotalMB > 0 && <div style={subStyle}>{vramStr}</div>}
          {tempC > 0 && (
            <div style={{ ...subStyle, color: tempColor(tempC) }}>&#127777; {tempC}°C</div>
          )}
        </div>
      </div>
      <ProgressBar percent={busyPercent} />
      <div style={numStyle}>{busyPercent}%</div>
    </div>
  );
}
