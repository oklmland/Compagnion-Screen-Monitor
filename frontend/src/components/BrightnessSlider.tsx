interface Props {
  value: number;
  onChange: (v: number) => void;
  onClose: () => void;
}

export default function BrightnessSlider({ value, onChange, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">&#9728; Luminosité</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
          <span style={{ fontSize: 16 }}>&#9680;</span>
          <input
            type="range" min={1} max={100} value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--blue)' }}
          />
          <span style={{ fontSize: 16 }}>&#9728;</span>
        </div>
        <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 700, color: 'var(--blue)', margin: '4px 0' }}>
          {value}%
        </div>
        <button className="btn-back" onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
}
