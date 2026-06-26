import { useState, useEffect } from 'react';
import { SystemMetrics } from '../hooks/useSystemMetrics';
import ClockStyleModal from './ClockStyleModal';

type ClockStyle = 'digital' | 'analog' | 'minimal';
type PowerProfile = 'power-saver' | 'balanced' | 'performance';

interface Props {
  metrics: SystemMetrics;
  onControl: (action: string, value?: unknown) => void;
}

const POWER_PROFILES: { key: PowerProfile; label: string; icon: string }[] = [
  { key: 'power-saver', label: 'Éco',   icon: '🌿' },
  { key: 'balanced',    label: 'Éq.',   icon: '⚖️' },
  { key: 'performance', label: 'Perf',  icon: '⚡' },
];

function CompactPowerButton({ current, onSelect }: { current: PowerProfile; onSelect: (action: string, value?: unknown) => void }) {
  const idx = POWER_PROFILES.findIndex(p => p.key === current);
  const cur = POWER_PROFILES[idx >= 0 ? idx : 1];
  const next = POWER_PROFILES[(idx + 1) % POWER_PROFILES.length];
  return (
    <button
      onClick={() => onSelect('set-power-profile', next.key)}
      title={`Mode : ${cur.label} — tap pour passer à ${next.label}`}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: '0.5vmin',
        padding: 'clamp(8px, 1.8vmin, 22px) clamp(10px, 2vmin, 24px)',
        background: 'rgba(59,130,246,0.10)',
        border: '1px solid rgba(59,130,246,0.35)',
        borderRadius: 'var(--radius)',
        color: 'var(--blue)',
        transition: 'background 0.2s',
      }}
    >
      <span style={{ fontSize: 'var(--fs-big)', lineHeight: 1 }}>{cur.icon}</span>
      <span style={{ fontSize: 'var(--fs-label)', fontWeight: 600, lineHeight: 1, letterSpacing: '0.03em' }}>{cur.label}</span>
    </button>
  );
}

function padTwo(n: number) { return String(n).padStart(2, '0'); }

function weatherIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 2) return '⛅';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '\u{1F32B}️';
  if (code >= 51 && code <= 67) return '\u{1F327}️';
  if (code >= 71 && code <= 77) return '\u{1F328}️';
  if (code >= 80 && code <= 82) return '\u{1F326}️';
  if (code >= 95) return '⛈️';
  return '\u{1F324}️';
}

function AnalogClock({ time }: { time: Date }) {
  const s = time.getSeconds();
  const m = time.getMinutes() + s / 60;
  const h = (time.getHours() % 12) + m / 60;
  const hand = (angleDeg: number, len: number, w: number, color: string) => {
    const a = (angleDeg - 90) * Math.PI / 180;
    return (
      <line
        x1={50} y1={50}
        x2={50 + Math.cos(a) * len} y2={50 + Math.sin(a) * len}
        stroke={color} strokeWidth={w} strokeLinecap="round"
      />
    );
  };
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <radialGradient id="face-hdr" cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor="#1c2740" />
          <stop offset="100%" stopColor="#080c12" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="49" fill="url(#face-hdr)" stroke="#243049" strokeWidth="1.5" />
      {[...Array(60)].map((_, i) => {
        const a = (i * 6 - 90) * Math.PI / 180;
        const major = i % 5 === 0;
        return (
          <line key={i}
            x1={50 + Math.cos(a) * (major ? 39 : 42)} y1={50 + Math.sin(a) * (major ? 39 : 42)}
            x2={50 + Math.cos(a) * 45} y2={50 + Math.sin(a) * 45}
            stroke={major ? '#7aa2d8' : '#2a3650'}
            strokeWidth={major ? 1.6 : 0.7} strokeLinecap="round"
          />
        );
      })}
      {[[12, 0, -33], [3, 33, 0], [6, 0, 33], [9, -33, 0]].map(([n, dx, dy]) => (
        <text key={n} x={50 + dx} y={50 + dy + 4} textAnchor="middle"
          fontSize="9" fontWeight="700" fill="#cfe0f5" fontFamily="Nunito,Roboto,system-ui">{n}</text>
      ))}
      {hand(h * 30, 26, 3, '#ffffff')}
      {hand(m * 6, 36, 2.2, '#ffffff')}
      {hand(s * 6, 40, 1, '#f44336')}
      <circle cx="50" cy="50" r="2.4" fill="#fff" />
      <circle cx="50" cy="50" r="1.1" fill="#f44336" />
    </svg>
  );
}

export default function ClockSection({ metrics, onControl }: Props) {
  const [time, setTime] = useState(new Date());
  const [style, setStyle] = useState<ClockStyle>('digital');
  const [showStyles, setShowStyles] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const DAYS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const MONTHS = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
  const dateStr = `${DAYS[time.getDay()]} ${time.getDate()} ${MONTHS[time.getMonth()]}`;

  const w = metrics.weather;
  const weatherRange = w.available ? `${w.minC}~${w.maxC}°C` : null;

  return (
    <>
      <div style={{ padding: '1.5vmin 2vmin', borderBottom: '1px solid var(--card-border)' }}>

        <div style={{ display: 'flex', alignItems: 'stretch', gap: '2vmin' }}>

          {/* Colonne gauche : météo grande (hauteur = heure + date) */}
          {w.available && (
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '0.3vmin', flexShrink: 0,
            }}>
              <span style={{ fontSize: 'var(--fs-clock)', lineHeight: 1 }}>{weatherIcon(w.code)}</span>
              <span style={{
                fontFamily: 'var(--font-clock)',
                fontSize: 'var(--fs-clock)', fontWeight: 300,
                fontVariantNumeric: 'tabular-nums', lineHeight: 1,
              }}>
                {w.currentC}°
              </span>
            </div>
          )}

          {/* Colonne centre : heure centrée + date plus grande en dessous */}
          <button
            onClick={() => setShowStyles(true)}
            style={{
              flex: 1, minWidth: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              gap: '0.6vmin',
            }}
            aria-label="Changer le style d'horloge"
          >
            {style === 'analog' ? (
              <div style={{ width: 'min(22vw, 20vh)', aspectRatio: '1' }}>
                <AnalogClock time={time} />
              </div>
            ) : style === 'minimal' ? (
              <div style={{
                fontFamily: 'var(--font-clock)',
                fontSize: 'var(--fs-clock)', fontWeight: 300, letterSpacing: 1,
                color: 'var(--blue)', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
              }}>
                {padTwo(time.getHours())}:{padTwo(time.getMinutes())}
              </div>
            ) : (
              <div style={{
                fontFamily: 'var(--font-clock)',
                fontSize: 'var(--fs-clock)', fontWeight: 300, letterSpacing: 1,
                fontVariantNumeric: 'tabular-nums', lineHeight: 1,
              }}>
                {padTwo(time.getHours())}:{padTwo(time.getMinutes())}:{padTwo(time.getSeconds())}
              </div>
            )}
            <div style={{
              fontFamily: 'var(--font-clock)',
              fontSize: 'clamp(18px, 5vmin, 54px)', fontWeight: 400,
              color: 'var(--text-secondary)', lineHeight: 1.1, whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
            }}>
              {dateStr}
            </div>
          </button>

          {/* Colonne droite : bouton power compact (tap = mode suivant) */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <CompactPowerButton current={metrics.powerProfile} onSelect={onControl} />
          </div>

        </div>

      </div>

      {showStyles && (
        <ClockStyleModal
          current={style}
          onSelect={(s) => { setStyle(s); setShowStyles(false); }}
          onClose={() => setShowStyles(false)}
        />
      )}
    </>
  );
}
