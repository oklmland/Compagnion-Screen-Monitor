import UsageBar from './UsageBar';
import { cardStyle, labelStyle, bigStyle, subStyle, tempTopStyle, tempColor } from './widgetStyles';

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
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.2vmin', minWidth: 0 }}>
        <span style={{ ...labelStyle, marginBottom: 0, flex: 1 }}>{name}</span>
        {tempC > 0 && <span style={{ ...tempTopStyle, color: tempColor(tempC) }}>{tempC}°C</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1vmin' }}>
        <span style={bigStyle}>GPU</span>
        {vramTotalMB > 0 && <span style={subStyle}>{vramStr}</span>}
      </div>
      <UsageBar percent={busyPercent} />
    </div>
  );
}
