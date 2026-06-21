interface Props {
  percent: number;
}

function barColor(pct: number): string {
  if (pct >= 90) return 'var(--red)';
  if (pct >= 70) return 'var(--orange)';
  return 'var(--blue)';
}

export default function ProgressBar({ percent }: Props) {
  return (
    <div className="progress-bar-track">
      <div
        className="progress-bar-fill"
        style={{ width: `${Math.min(100, percent)}%`, background: barColor(percent) }}
      />
    </div>
  );
}
