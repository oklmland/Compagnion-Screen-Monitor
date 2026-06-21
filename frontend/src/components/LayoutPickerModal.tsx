export type Layout = '2x2' | '1col' | '3col' | 'left-big' | '2col' | '1row';

interface Props {
  current: Layout;
  onSelect: (l: Layout) => void;
  onClose: () => void;
}

const layouts: { key: Layout; preview: string[][] }[] = [
  { key: '2x2', preview: [['■■', '■■'], ['■■', '■■']] },
  { key: '1col', preview: [['████'], ['████'], ['████'], ['████']] },
  { key: '3col', preview: [['■', '■', '■'], ['■', '■', '■']] },
  { key: 'left-big', preview: [['████', '■■'], ['████', '■■']] },
  { key: '2col', preview: [['████', '████'], ['████', '████']] },
  { key: '1row', preview: [['■■■■■■■■']] },
];

function MiniGrid({ rows }: { rows: string[][] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {rows.map((row, ri) => (
        <div key={ri} style={{ display: 'flex', gap: 3 }}>
          {row.map((cell, ci) => (
            <div key={ci} style={{
              height: 14, flex: cell.length, background: '#555', borderRadius: 2,
            }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export default function LayoutPickerModal({ current, onSelect, onClose }: Props) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Disposition</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
          {layouts.map(({ key, preview }) => (
            <button
              key={key}
              onClick={() => onSelect(key)}
              style={{
                background: key === current ? 'var(--blue-glow)' : '#1a1a1a',
                border: `2px solid ${key === current ? 'var(--blue)' : 'transparent'}`,
                borderRadius: 'var(--radius-sm)',
                padding: '12px 8px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              }}
            >
              <MiniGrid rows={preview} />
              {key === current && (
                <div style={{ width: 18, height: 18, background: 'var(--blue)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                  ✓
                </div>
              )}
              {key !== current && <div style={{ width: 18, height: 18, border: '1.5px solid #333', borderRadius: '50%' }} />}
            </button>
          ))}
        </div>
        <button className="btn-back" onClick={onClose}>Retour</button>
      </div>
    </div>
  );
}
