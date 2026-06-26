import { useState, useEffect } from 'react';
import { SystemMetrics } from '../hooks/useSystemMetrics';
import ClockStyleModal from './ClockStyleModal';
import PowerModeModal from './PowerModeModal';

type ClockStyle = 'digital' | 'analog' | 'minimal';

interface Props {
  metrics: SystemMetrics;
  onControl: (action: string, value?: unknown) => void;
}

function padTwo(n: number) { return String(n).padStart(2, '0'); }

// Code météo WMO -> emoji (https://open-meteo.com/en/docs)
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

// Grande horloge analogique vectorielle (viewBox 0..100, scale via le conteneur).
function AnalogClock({ time, weatherText, weatherEmoji }: { time: Date; weatherText?: string; weatherEmoji?: string }) {
  const s = time.getSeconds();
  const m = time.getMinutes() + s / 60;
  const h = (time.getHours() % 12) + m / 60;
  const hand = (angleDeg: number, len: number, w: number, color: string, round = true) => {
    const a = (angleDeg - 90) * Math.PI / 180;
    return (
      <line
        x1={50} y1={50}
        x2={50 + Math.cos(a) * len} y2={50 + Math.sin(a) * len}
        stroke={color} strokeWidth={w} strokeLinecap={round ? 'round' : 'butt'}
      />
    );
  };
  return (
    <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <radialGradient id="face" cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor="#1c2740" />
          <stop offset="100%" stopColor="#0c1018" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="49" fill="url(#face)" stroke="#243049" strokeWidth="1.5" />
      {/* graduations */}
      {[...Array(60)].map((_, i) => {
        const a = (i * 6 - 90) * Math.PI / 180;
        const major = i % 5 === 0;
        const r1 = major ? 39 : 42;
        const r2 = 45;
        return (
          <line key={i}
            x1={50 + Math.cos(a) * r1} y1={50 + Math.sin(a) * r1}
            x2={50 + Math.cos(a) * r2} y2={50 + Math.sin(a) * r2}
            stroke={major ? '#7aa2d8' : '#3a4660'}
            strokeWidth={major ? 1.6 : 0.7} strokeLinecap="round"
          />
        );
      })}
      {/* chiffres 12 3 6 9 */}
      {[[12, 0, -33], [3, 33, 0], [6, 0, 33], [9, -33, 0]].map(([n, dx, dy]) => (
        <text key={n} x={50 + dx} y={50 + dy + 4} textAnchor="middle"
          fontSize="9" fontWeight="700" fill="#cfe0f5" fontFamily="system-ui">{n}</text>
      ))}
      {/* météo en sous-cadran facon PDF */}
      {weatherText && (
        <text x="50" y="68" textAnchor="middle" fontSize="7" fill="#8aa0c0" fontFamily="system-ui">
          {weatherEmoji} {weatherText}
        </text>
      )}
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
  const [showPower, setShowPower] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const dayName = days[time.getDay()];
  const dateStr = `${dayName} ${padTwo(time.getDate())}.${padTwo(time.getMonth() + 1)}.${time.getFullYear()}`;

  const profileLabel = {
    'power-saver': 'Éco',
    'balanced': 'Équilibré',
    'performance': 'Performance',
  }[metrics.powerProfile];

  const w = metrics.weather;
  const weatherRange = w.available ? `${w.minC}~${w.maxC}°C` : undefined;

  return (
    <>
      <div style={{ padding: '1.5vmin 2vmin', borderBottom: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '2vmin' }}>
          <button
            onClick={() => setShowStyles(true)}
            style={{ textAlign: 'left', flex: 1, display: 'flex', alignItems: 'center', gap: '2vmin', minWidth: 0 }}
            aria-label="Changer le style d'horloge"
          >
            {style === 'analog' ? (
              <>
                <div style={{ width: 'min(26vw, 22vh)', aspectRatio: '1', flexShrink: 0 }}>
                  <AnalogClock time={time} weatherText={weatherRange} weatherEmoji={w.available ? weatherIcon(w.code) : undefined} />
                </div>
                <div style={{ fontSize: 'var(--fs-sub)', color: 'var(--text-secondary)' }}>{dateStr}</div>
              </>
            ) : style === 'minimal' ? (
              <div>
                <div style={{ fontSize: 'var(--fs-clock)', fontWeight: 200, letterSpacing: 2, color: 'var(--blue)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                  {padTwo(time.getHours())}:{padTwo(time.getMinutes())}
                </div>
                <div style={{ fontSize: 'var(--fs-sub)', color: 'var(--text-secondary)', marginTop: '0.6vmin' }}>{dateStr}</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 'var(--fs-clock)', fontWeight: 700, letterSpacing: 1, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                  {padTwo(time.getHours())}:{padTwo(time.getMinutes())}:{padTwo(time.getSeconds())}
                </div>
                <div style={{ fontSize: 'var(--fs-sub)', color: 'var(--text-secondary)', marginTop: '0.8vmin' }}>{dateStr}</div>
              </div>
            )}
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1vmin', flexShrink: 0 }}>
            {w.available ? (
              <div style={{ fontSize: 'var(--fs-sub)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.8vmin' }}>
                <span style={{ fontSize: 'var(--fs-num)' }}>{weatherIcon(w.code)}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>{weatherRange}</span>
              </div>
            ) : (
              <div style={{ fontSize: 'var(--fs-sub)', color: 'var(--text-secondary)' }}>&#127780; --</div>
            )}
            <button
              onClick={() => setShowPower(true)}
              style={{
                background: 'var(--blue)',
                borderRadius: '999px',
                padding: '1vmin 2.2vmin',
                fontSize: 'var(--fs-sub)',
                fontWeight: 600,
                color: 'white',
                whiteSpace: 'nowrap',
              }}
            >
              {profileLabel}
            </button>
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
      {showPower && (
        <PowerModeModal
          current={metrics.powerProfile}
          onSelect={(p) => { onControl('set-power-profile', p); setShowPower(false); }}
          onClose={() => setShowPower(false)}
        />
      )}
    </>
  );
}
