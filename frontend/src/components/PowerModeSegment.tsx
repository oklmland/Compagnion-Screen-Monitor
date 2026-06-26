type PowerProfile = 'power-saver' | 'balanced' | 'performance';

const PROFILES: { key: PowerProfile; label: string; icon: string }[] = [
  { key: 'power-saver', label: 'Éco',        icon: '🌿' },
  { key: 'balanced',    label: 'Équilibré',  icon: '⚖️' },
  { key: 'performance', label: 'Performance', icon: '⚡' },
];

interface Props {
  current: PowerProfile;
  onSelect: (action: string, value?: unknown) => void;
}

export default function PowerModeSegment({ current, onSelect }: Props) {
  return (
    <div style={{
      display: 'flex',
      background: '#0a1020',
      border: '1px solid var(--card-border)',
      borderRadius: '999px',
      padding: '3px',
      gap: '2px',
    }}>
      {PROFILES.map((p) => {
        const active = p.key === current;
        return (
          <button
            key={p.key}
            onClick={() => onSelect('set-power-profile', p.key)}
            style={{
              flex: 1,
              padding: 'clamp(6px, 1.2vmin, 14px) clamp(8px, 1.6vmin, 18px)',
              borderRadius: '999px',
              background: active ? 'var(--blue)' : 'transparent',
              color: active ? '#fff' : 'var(--text-secondary)',
              fontSize: 'var(--fs-sub)',
              fontWeight: active ? 700 : 500,
              transition: 'background 0.2s ease, color 0.2s ease',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6vmin',
            }}
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}
