import ProgressBar from './ProgressBar';

interface Props {
  percent: number;
}

// Barre de progression avec le % d'usage à sa droite (même taille que --fs-num).
export default function UsageBar({ percent }: Props) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1.6vmin' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <ProgressBar percent={percent} />
      </div>
      <span style={{
        fontSize: 'var(--fs-num)',
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
        flexShrink: 0,
      }}>
        {percent}%
      </span>
    </div>
  );
}
