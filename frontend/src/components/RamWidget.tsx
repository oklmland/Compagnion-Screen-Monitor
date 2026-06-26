import UsageBar from './UsageBar';
import { cardStyle, labelStyle, bigStyle, subStyle } from './widgetStyles';

interface Props {
  usedGB: number;
  totalGB: number;
  percent: number;
}

export default function RamWidget({ usedGB, totalGB, percent }: Props) {
  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.2vmin' }}>
        <span style={{ ...labelStyle, marginBottom: 0 }}>Mémoire système</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1vmin' }}>
        <span style={bigStyle}>RAM</span>
        <span style={subStyle}>{usedGB}/{totalGB}G</span>
      </div>
      <UsageBar percent={percent} />
    </div>
  );
}
