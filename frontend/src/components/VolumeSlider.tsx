interface Props {
  value: number;
  onChange: (v: number) => void;
  onClose: () => void;
}

export default function VolumeSlider({ value, onChange, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">&#128266; Volume</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
          <span style={{ fontSize: 16 }}>&#128263;</span>
          <input
            type="range" min={0} max={100} value={value}
            onChange={(e) => onChange(parseInt(e.target.value))}
            style={{ flex: 1, accentColor: 'var(--blue)' }}
          />
          <span style={{ fontSize: 16 }}>&#128266;</span>
        </div>
        <div style={{ textAlign: 'center', fontSize: 24, fontWeight: 700, color: 'var(--blue)', margin: '4px 0' }}>
          {value}%
        </div>
        <button className="btn-back" onClick={onClose}>Fermer</button>
      </div>
    </div>
  );
}
