import ProgressBar from './ProgressBar';

interface Props {
  name: string;
  usedGB: number;
  totalGB: number;
  percent: number;
}

export default function DiskWidget({ name, usedGB, totalGB, percent }: Props) {
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>SSD</span>
        <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          {usedGB}/{totalGB}G
        </span>
      </div>
      <ProgressBar percent={percent} />
      <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4, textAlign: 'right' }}>{percent}%</div>
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
