type PowerProfile = 'power-saver' | 'balanced' | 'performance';

interface Props {
  current: PowerProfile;
  onSelect: (p: PowerProfile) => void;
  onClose: () => void;
}

const profiles: { key: PowerProfile; label: string; desc: string; watt: string; needleAngle: number }[] = [
  { key: 'power-saver', label: 'Éco', desc: 'Réduit la consommation', watt: '~25W', needleAngle: -60 },
  { key: 'balanced', label: 'Équilibré', desc: 'Usage quotidien', watt: '~35W', needleAngle: 0 },
  { key: 'performance', label: 'Performance', desc: 'Charge maximale', watt: '~65W', needleAngle: 60 },
];

function Speedometer({ angle }: { angle: number }) {
  const cx = 70, cy = 70, r = 55;
  const startAngle = -150, endAngle = -30;
  const toRad = (d: number) => d * Math.PI / 180;
  const arcPath = (from: number, to: number) => {
    const x1 = cx + r * Math.cos(toRad(from));
    const y1 = cy + r * Math.sin(toRad(from));
    const x2 = cx + r * Math.cos(toRad(to));
    const y2 = cy + r * Math.sin(toRad(to));
    const large = Math.abs(to - from) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  };
  const needleAngleRad = toRad(angle - 90);
  const nx = cx + r * 0.7 * Math.cos(needleAngleRad);
  const ny = cy + r * 0.7 * Math.sin(needleAngleRad);
  return (
    <svg width={140} height={90} viewBox="0 0 140 90" style={{ margin: '0 auto', display: 'block' }}>
      <path d={arcPath(startAngle, -90)} fill="none" stroke="#1e3a5f" strokeWidth="12" strokeLinecap="round" />
      <path d={arcPath(-90, -30)} fill="none" stroke="#0d2137" strokeWidth="12" strokeLinecap="round" />
      <path d={arcPath(startAngle, angle - 90)} fill="none" stroke="var(--blue)" strokeWidth="12" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={nx} y2={ny} stroke="white" strokeWidth="3" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="6" fill="#1a1a1a" stroke="white" strokeWidth="2" />
    </svg>
  );
}

function Toggle({ active }: { active: boolean }) {
  return (
    <div style={{
      width: 44, height: 24, borderRadius: 12,
      background: active ? 'var(--blue)' : '#333',
      position: 'relative', transition: 'background 0.2s',
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: 'white',
        position: 'absolute', top: 3, left: active ? 23 : 3,
        transition: 'left 0.2s',
      }} />
    </div>
  );
}

export default function PowerModeModal({ current, onSelect, onClose }: Props) {
  const active = profiles.find(p => p.key === current) ?? profiles[1];
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <Speedometer angle={active.needleAngle} />
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          {profiles.map((p) => (
            <button
              key={p.key}
              onClick={() => onSelect(p.key)}
              style={{
                flex: 1,
                background: p.key === current ? 'rgba(33,150,243,0.12)' : '#1a1a1a',
                border: `2px solid ${p.key === current ? 'var(--blue)' : '#2a2a2a'}`,
                borderRadius: 'var(--radius)',
                padding: '12px 6px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{p.label}</span>
              <span style={{ fontSize: 10, color: 'var(--text-secondary)', textAlign: 'center' }}>{p.desc}</span>
              <span style={{ fontSize: 11, color: 'var(--blue)' }}>{p.watt}</span>
              <Toggle active={p.key === current} />
            </button>
          ))}
        </div>
        <button className="btn-back" onClick={onClose}>Retour</button>
      </div>
    </div>
  );
}
