type ClockStyle = 'digital' | 'analog' | 'minimal';

interface Props {
  current: ClockStyle;
  onSelect: (style: ClockStyle) => void;
  onClose: () => void;
}

const styles: { key: ClockStyle; label: string; preview: string }[] = [
  { key: 'digital', label: 'Numérique', preview: '20:51:30' },
  { key: 'analog', label: 'Analogique', preview: '◔' },
  { key: 'minimal', label: 'Minimal', preview: '20:51' },
];

export default function ClockStyleModal({ current, onSelect, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Style d'horloge</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {styles.map(({ key, label, preview }) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              style={{
                flex: 1,
                background: key === current ? 'var(--blue-glow)' : '#1e1e1e',
                border: `2px solid ${key === current ? 'var(--blue)' : 'transparent'}`,
                borderRadius: 'var(--radius)',
                padding: '16px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span style={{ fontSize: 18, color: key === current ? 'var(--blue)' : 'var(--text-secondary)' }}>
                {preview}
              </span>
              <span style={{ fontSize: 11, color: key === current ? 'var(--blue)' : 'var(--text-secondary)' }}>
                {label}
              </span>
            </button>
          ))}
        </div>
        <button className="btn-back" onClick={onClose}>Retour</button>
      </div>
    </div>
  );
}
