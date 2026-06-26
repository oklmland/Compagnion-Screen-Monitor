import ProgressBar from './ProgressBar';
import { cardStyle, labelStyle, bigStyle, subStyle, numStyle } from './widgetStyles';

interface Props {
  usedGB: number;
  totalGB: number;
  percent: number;
}

export default function RamWidget({ usedGB, totalGB, percent }: Props) {
  return (
    <div style={cardStyle}>
      <div style={labelStyle}>Mémoire système</div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '1vmin' }}>
        <span style={bigStyle}>RAM</span>
        <span style={subStyle}>{usedGB}/{totalGB}G</span>
      </div>
      <ProgressBar percent={percent} />
      <div style={numStyle}>{percent}%</div>
    </div>
  );
}
