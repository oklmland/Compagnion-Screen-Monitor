import UsageBar from './UsageBar';
import { cardStyle, labelStyle, bigStyle, subStyle } from './widgetStyles';

interface Props {
  name: string;
  usedGB: number;
  totalGB: number;
  percent: number;
}

export default function DiskWidget({ name, usedGB, totalGB, percent }: Props) {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.2vmin' }}>
        <span style={{ ...labelStyle, marginBottom: 0 }}>{name}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1vmin' }}>
        <span style={bigStyle}>SSD</span>
        <span style={subStyle}>{usedGB}/{totalGB}G</span>
      </div>
      <UsageBar percent={percent} />
    </div>
  );
}
