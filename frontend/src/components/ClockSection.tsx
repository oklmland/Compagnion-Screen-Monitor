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
  if (code === 0) return '☀️';                 // ciel clair ☀️
  if (code <= 2) return '⛅';                        // peu nuageux ⛅
  if (code === 3) return '☁️';                 // couvert ☁️
  if (code === 45 || code === 48) return '\u{1F32B}️'; // brouillard 🌫️
  if (code >= 51 && code <= 67) return '\u{1F327}️';   // pluie 🌧️
  if (code >= 71 && code <= 77) return '\u{1F328}️';   // neige 🌨️
  if (code >= 80 && code <= 82) return '\u{1F326}️';   // averses 🌦️
  if (code >= 95) return '⛈️';                 // orage ⛈️
  return '\u{1F324}️';                              // éclaircies 🌤️
}

function AnalogClock({ size = 80 }: { size?: number }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const s = time.getSeconds();
  const m = time.getMinutes() + s / 60;
  const h = (time.getHours() % 12) + m / 60;
  const secDeg = s * 6;
  const minDeg = m * 6;
  const hourDeg = h * 30;
  const cx = size / 2, cy = size / 2, r = size / 2 - 4;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#2a2a2a" strokeWidth="2" />
      {[...Array(12)].map((_, i) => {
        const ang = (i * 30 - 90) * Math.PI / 180;
        const x1 = cx + Math.cos(ang) * (r - 6), y1 = cy + Math.sin(ang) * (r - 6);
        const x2 = cx + Math.cos(ang) * (r - 2), y2 = cy + Math.sin(ang) * (r - 2);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#444" strokeWidth="1.5" />;
      })}
      {/* hour hand */}
      <line
        x1={cx} y1={cy}
        x2={cx + Math.cos((hourDeg - 90) * Math.PI / 180) * r * 0.5}
        y2={cy + Math.sin((hourDeg - 90) * Math.PI / 180) * r * 0.5}
        stroke="white" strokeWidth="2.5" strokeLinecap="round"
      />
      {/* minute hand */}
      <line
        x1={cx} y1={cy}
        x2={cx + Math.cos((minDeg - 90) * Math.PI / 180) * r * 0.7}
        y2={cy + Math.sin((minDeg - 90) * Math.PI / 180) * r * 0.7}
        stroke="white" strokeWidth="1.5" strokeLinecap="round"
      />
      {/* second hand */}
      <line
        x1={cx} y1={cy}
        x2={cx + Math.cos((secDeg - 90) * Math.PI / 180) * r * 0.8}
        y2={cy + Math.sin((secDeg - 90) * Math.PI / 180) * r * 0.8}
        stroke="#f44336" strokeWidth="1" strokeLinecap="round"
      />
      <circle cx={cx} cy={cy} r="2" fill="white" />
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

  return (
    <>
      <div style={{ padding: '12px 12px 8px', borderBottom: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <button
            onClick={() => setShowStyles(true)}
            style={{ textAlign: 'left', flex: 1 }}
            aria-label="Changer le style d'horloge"
          >
            {style === 'analog' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AnalogClock size={72} />
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{dateStr}</div>
                </div>
              </div>
            ) : style === 'minimal' ? (
              <div>
                <div style={{ fontSize: 28, fontWeight: 200, letterSpacing: 2, color: 'var(--blue)', fontVariantNumeric: 'tabular-nums' }}>
                  {padTwo(time.getHours())}:{padTwo(time.getMinutes())}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>{dateStr}</div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 1, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                  {padTwo(time.getHours())}:{padTwo(time.getMinutes())}:{padTwo(time.getSeconds())}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>{dateStr}</div>
              </div>
            )}
          </button>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            {metrics.weather.available ? (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'right', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ fontSize: 15 }}>{weatherIcon(metrics.weather.code)}</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {metrics.weather.minC}~{metrics.weather.maxC}°C
                </span>
              </div>
            ) : (
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'right' }}>
                &#127780; --
              </div>
            )}
            <button
              onClick={() => setShowPower(true)}
              style={{
                background: 'var(--blue)',
                borderRadius: 20,
                padding: '6px 12px',
                fontSize: 12,
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
