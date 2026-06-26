import { useState, useEffect } from 'react';
import { SystemMetrics } from '../hooks/useSystemMetrics';

type FullClockStyle = 'classique' | 'futuriste' | 'minimal' | 'meteo';
const STYLES: FullClockStyle[] = ['classique', 'futuriste', 'minimal', 'meteo'];
const LABELS: Record<FullClockStyle, string> = {
  classique: 'Classique',
  futuriste: 'Futuriste',
  minimal: 'Minimal',
  meteo: 'Météo',
};

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

// Analog SVG with roman numerals
function ClassiqueClock({ time, size = '80vmin' }: { time: Date; size?: string }) {
  const s = time.getSeconds();
  const m = time.getMinutes() + s / 60;
  const h = (time.getHours() % 12) + m / 60;
  const hand = (angleDeg: number, len: number, w: number, color: string) => {
    const a = (angleDeg - 90) * Math.PI / 180;
    return (
      <line x1={50} y1={50} x2={50 + Math.cos(a) * len} y2={50 + Math.sin(a) * len}
        stroke={color} strokeWidth={w} strokeLinecap="round" />
    );
  };

  const ROMAN = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];

  return (
    <svg viewBox="0 0 100 100" style={{ width: size, height: size, display: 'block' }}>
      <defs>
        <radialGradient id="face-full" cx="50%" cy="42%" r="65%">
          <stop offset="0%" stopColor="#1c2740" />
          <stop offset="100%" stopColor="#080c12" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="49" fill="url(#face-full)" stroke="#243049" strokeWidth="1" />
      {/* Outer ring */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="#1e2d45" strokeWidth="0.5" />
      {/* Tick marks */}
      {[...Array(60)].map((_, i) => {
        const a = (i * 6 - 90) * Math.PI / 180;
        const major = i % 5 === 0;
        return (
          <line key={i}
            x1={50 + Math.cos(a) * (major ? 38 : 42)} y1={50 + Math.sin(a) * (major ? 38 : 42)}
            x2={50 + Math.cos(a) * 45} y2={50 + Math.sin(a) * 45}
            stroke={major ? '#7aa2d8' : '#2a3650'}
            strokeWidth={major ? 1.4 : 0.6} strokeLinecap="round"
          />
        );
      })}
      {/* Roman numerals */}
      {ROMAN.map((label, i) => {
        const a = (i * 30 - 90) * Math.PI / 180;
        const r = 32;
        return (
          <text key={i}
            x={50 + Math.cos(a) * r} y={50 + Math.sin(a) * r + 3}
            textAnchor="middle" fontSize="5.5" fontWeight="600"
            fill="#cfe0f5" fontFamily="Inter,serif"
          >{label}</text>
        );
      })}
      {/* Hands */}
      {hand(h * 30, 22, 3.5, '#ffffff')}
      {hand(m * 6, 33, 2.5, '#ffffff')}
      {hand(s * 6, 38, 1.2, '#f44336')}
      {/* Center cap */}
      <circle cx="50" cy="50" r="3" fill="#1a2540" stroke="#7aa2d8" strokeWidth="1" />
      <circle cx="50" cy="50" r="1.2" fill="#f44336" />
    </svg>
  );
}

// Futuristic concentric ring clock
function FuturisteClock({ time }: { time: Date }) {
  const sec = time.getSeconds() + time.getMilliseconds() / 1000;
  const min = time.getMinutes() + sec / 60;
  const hr  = (time.getHours() % 12) + min / 60;

  const CX = 100, CY = 100;
  const rs = 82, rm = 65, rh = 48;
  const Cs = 2 * Math.PI * rs;
  const Cm = 2 * Math.PI * rm;
  const Ch = 2 * Math.PI * rh;

  const arcFill = (r: number, C: number, frac: number) => ({
    r, C, fill: frac * C,
  });

  const s_arc = arcFill(rs, Cs, sec / 60);
  const m_arc = arcFill(rm, Cm, min / 60);
  const h_arc = arcFill(rh, Ch, hr / 12);

  const hh = padTwo(time.getHours());
  const mm = padTwo(time.getMinutes());
  const ss = padTwo(time.getSeconds());

  return (
    <svg viewBox="0 0 200 200" style={{ width: 'min(80vw, 70vh)', height: 'min(80vw, 70vh)', display: 'block' }}>
      <defs>
        <filter id="glow-s">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-m">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="glow-h">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background */}
      <circle cx={CX} cy={CY} r="99" fill="#080c12" />

      {/* Track rings */}
      <circle cx={CX} cy={CY} r={rs} fill="none" stroke="#1a2336" strokeWidth="8" />
      <circle cx={CX} cy={CY} r={rm} fill="none" stroke="#1a2336" strokeWidth="7" />
      <circle cx={CX} cy={CY} r={rh} fill="none" stroke="#1a2336" strokeWidth="6" />

      {/* Second ring — bright blue */}
      <circle cx={CX} cy={CY} r={s_arc.r} fill="none"
        stroke="#3b82f6" strokeWidth="8"
        strokeDasharray={`${s_arc.fill} ${s_arc.C}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${CX} ${CY})`}
        filter="url(#glow-s)"
      />

      {/* Minute ring — medium blue */}
      <circle cx={CX} cy={CY} r={m_arc.r} fill="none"
        stroke="#60a5fa" strokeWidth="7"
        strokeDasharray={`${m_arc.fill} ${m_arc.C}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${CX} ${CY})`}
        filter="url(#glow-m)"
      />

      {/* Hour ring — pale blue */}
      <circle cx={CX} cy={CY} r={h_arc.r} fill="none"
        stroke="#93c5fd" strokeWidth="6"
        strokeDasharray={`${h_arc.fill} ${h_arc.C}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${CX} ${CY})`}
        filter="url(#glow-h)"
      />

      {/* Center digital readout */}
      <text x={CX} y={CY - 4} textAnchor="middle" fontSize="16" fontWeight="700"
        fill="#ffffff" fontFamily="Inter,monospace" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {hh}:{mm}
      </text>
      <text x={CX} y={CY + 12} textAnchor="middle" fontSize="9" fontWeight="400"
        fill="#8fa8c8" fontFamily="Inter,monospace" style={{ fontVariantNumeric: 'tabular-nums' }}>
        :{ss}
      </text>
    </svg>
  );
}

// Minimal HH:MM
function MinimalClock({ time, dateStr }: { time: Date; dateStr: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
      <div style={{
        fontSize: 'clamp(72px, 26vmin, 240px)',
        fontWeight: 200,
        letterSpacing: '-3px',
        fontVariantNumeric: 'tabular-nums',
        color: 'var(--blue)',
        lineHeight: 0.9,
      }}>
        {padTwo(time.getHours())}:{padTwo(time.getMinutes())}
      </div>
      <div style={{
        fontSize: 'clamp(14px, 3vmin, 30px)',
        color: 'var(--text-secondary)',
        marginTop: '3vmin',
        letterSpacing: '0.25em',
        textTransform: 'uppercase',
        fontWeight: 300,
      }}>
        {dateStr}
      </div>
    </div>
  );
}

// Clock + weather panel
function MeteoClock({ time, weather, dateStr }: { time: Date; weather: SystemMetrics['weather']; dateStr: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      width: '100%', height: '100%', padding: '4vmin', gap: '3vmin',
    }}>
      <ClassiqueClock time={time} size="min(52vw, 50vh)" />
      <div style={{ fontSize: 'clamp(13px, 2.6vmin, 28px)', color: 'var(--text-secondary)' }}>{dateStr}</div>
      {weather.available ? (
        <div style={{
          background: 'var(--blue-subtle)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius)',
          padding: '2vmin 5vmin',
          textAlign: 'center',
          width: 'min(70vw, 400px)',
        }}>
          <div style={{ fontSize: 'clamp(36px, 8vmin, 72px)' }}>{weatherIcon(weather.code)}</div>
          <div style={{ fontSize: 'clamp(14px, 2.8vmin, 28px)', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1vmin' }}>
            {weather.city}
          </div>
          <div style={{
            fontSize: 'clamp(40px, 11vmin, 100px)', fontWeight: 700,
            color: 'var(--blue)', fontVariantNumeric: 'tabular-nums', lineHeight: 1,
          }}>
            {weather.currentC}°
          </div>
          <div style={{ fontSize: 'clamp(12px, 2.4vmin, 24px)', color: 'var(--text-secondary)', marginTop: '0.5vmin' }}>
            {weather.minC}° — {weather.maxC}°C
          </div>
        </div>
      ) : (
        <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--fs-sub)' }}>Météo indisponible</div>
      )}
    </div>
  );
}

export default function ClockPage({ metrics }: { metrics: SystemMetrics }) {
  const [time, setTime] = useState(new Date());
  const [styleIdx, setStyleIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const MONTHS = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
  const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const dateStr = `${DAYS[time.getDay()]} ${time.getDate()} ${MONTHS[time.getMonth()]}`;

  const currentStyle = STYLES[styleIdx];
  const cycle = () => setStyleIdx(i => (i + 1) % STYLES.length);

  return (
    <div
      onClick={cycle}
      style={{
        width: '100%', height: '100%',
        background: 'var(--bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        position: 'relative',
      }}
    >
      {currentStyle === 'classique' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2vmin' }}>
          <ClassiqueClock time={time} />
          <div style={{ fontSize: 'clamp(14px, 2.8vmin, 28px)', color: 'var(--text-secondary)' }}>{dateStr}</div>
        </div>
      )}
      {currentStyle === 'futuriste' && <FuturisteClock time={time} />}
      {currentStyle === 'minimal'   && <MinimalClock time={time} dateStr={dateStr} />}
      {currentStyle === 'meteo'     && <MeteoClock time={time} weather={metrics.weather} dateStr={dateStr} />}

      {/* Style indicator */}
      <div style={{
        position: 'absolute',
        bottom: 'clamp(32px, 7vmin, 64px)',
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 'var(--fs-label)',
        color: 'var(--text-secondary)',
        letterSpacing: '0.15em',
        textTransform: 'uppercase',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
      }}>
        {LABELS[currentStyle]}  ·  toucher pour changer
      </div>
    </div>
  );
}
