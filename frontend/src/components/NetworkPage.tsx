import { useState, useEffect } from 'react';
import { SystemMetrics } from '../hooks/useSystemMetrics';
import { cardStyle, labelStyle } from './widgetStyles';

const MAX_POINTS = 60;

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}j ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return <div style={{ flex: 1 }} />;
  const W = 300, H = 60;
  const max = Math.max(...data, 0.01);
  const pts = data.map((v, i) =>
    `${(i / (data.length - 1)) * W},${H - (v / max) * H * 0.88}`
  ).join(' ');
  const fillPts = `0,${H} ${pts} ${W},${H}`;
  const colorId = color.replace(/[^a-z0-9]/gi, '');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', flex: 1 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${colorId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#spark-${colorId})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5"
        strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

interface Props {
  metrics: SystemMetrics;
}

export default function NetworkPage({ metrics }: Props) {
  const [rxHistory, setRxHistory] = useState<number[]>([]);
  const [txHistory, setTxHistory] = useState<number[]>([]);

  useEffect(() => {
    setRxHistory(p => [...p.slice(-(MAX_POINTS - 1)), metrics.network.rxMBs]);
  }, [metrics.network.rxMBs]);

  useEffect(() => {
    setTxHistory(p => [...p.slice(-(MAX_POINTS - 1)), metrics.network.txMBs]);
  }, [metrics.network.txMBs]);

  const rx = metrics.network.rxMBs;
  const tx = metrics.network.txMBs;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      padding: 'clamp(12px, 2.5vmin, 32px)',
      gap: 'var(--gap)',
      overflow: 'hidden',
    }}>
      <div style={{ fontSize: 'var(--fs-sub)', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
        Réseau &amp; Système
      </div>

      {/* Speed cards */}
      <div style={{ display: 'flex', gap: 'var(--gap)', flex: 1, minHeight: 0 }}>

        {/* Download */}
        <div style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={labelStyle}>↓ Download</div>
          <div style={{ fontSize: 'var(--fs-big)', fontWeight: 800, color: 'var(--blue)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {rx.toFixed(2)}
          </div>
          <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-secondary)', marginBottom: '1vmin' }}>MB/s</div>
          <Sparkline data={rxHistory} color="#3b82f6" />
          <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-secondary)', textAlign: 'right', marginTop: '0.5vmin' }}>
            60s
          </div>
        </div>

        {/* Upload */}
        <div style={{ ...cardStyle, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={labelStyle}>↑ Upload</div>
          <div style={{ fontSize: 'var(--fs-big)', fontWeight: 800, color: 'var(--orange)', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
            {tx.toFixed(2)}
          </div>
          <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-secondary)', marginBottom: '1vmin' }}>MB/s</div>
          <Sparkline data={txHistory} color="#ff9800" />
          <div style={{ fontSize: 'var(--fs-label)', color: 'var(--text-secondary)', textAlign: 'right', marginTop: '0.5vmin' }}>
            60s
          </div>
        </div>

      </div>

      {/* System info */}
      <div style={{ ...cardStyle, flexDirection: 'row', gap: '4vmin', flexWrap: 'wrap', flexShrink: 0 }}>
        <div>
          <div style={labelStyle}>Uptime</div>
          <div style={{ fontSize: 'var(--fs-num)', fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
            {formatUptime(metrics.uptime)}
          </div>
        </div>
        {metrics.fans.length > 0 && metrics.fans.map((rpm, i) => (
          <div key={i}>
            <div style={labelStyle}>Ventilateur {metrics.fans.length > 1 ? i + 1 : ''}</div>
            <div style={{ fontSize: 'var(--fs-num)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
              {Math.round(rpm)}<span style={{ fontSize: 'var(--fs-label)', color: 'var(--text-secondary)', marginLeft: '0.4vmin' }}>r/m</span>
            </div>
          </div>
        ))}
        {metrics.fans.length === 0 && (
          <div>
            <div style={labelStyle}>Ventilateur</div>
            <div style={{ fontSize: 'var(--fs-sub)', color: 'var(--text-secondary)' }}>non détecté</div>
          </div>
        )}
        <div>
          <div style={labelStyle}>CPU</div>
          <div style={{ fontSize: 'var(--fs-num)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {metrics.cpu.tempC}°<span style={{ fontSize: 'var(--fs-label)', color: 'var(--text-secondary)' }}>C</span>
          </div>
        </div>
        <div>
          <div style={labelStyle}>GPU</div>
          <div style={{ fontSize: 'var(--fs-num)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {metrics.gpu.tempC}°<span style={{ fontSize: 'var(--fs-label)', color: 'var(--text-secondary)' }}>C</span>
          </div>
        </div>
      </div>
    </div>
  );
}
