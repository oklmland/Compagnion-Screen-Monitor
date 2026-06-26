import { useState, useEffect } from 'react';
import { SystemMetrics } from '../hooks/useSystemMetrics';
import { useDebouncedControl } from '../hooks/useDebouncedControl';
import { cardStyle, labelStyle } from './widgetStyles';
import PowerModeSegment from './PowerModeSegment';

interface Props {
  metrics: SystemMetrics;
  onControl: (action: string, value?: unknown) => void;
}

export default function ControlsPage({ metrics, onControl }: Props) {
  const [brightness, setBrightness] = useState(metrics.brightness);
  const [volume, setVolume] = useState(metrics.volume);

  // Keep sliders in sync with live metrics (e.g., change from BottomBar on Page 1)
  useEffect(() => { setBrightness(metrics.brightness); }, [metrics.brightness]);
  useEffect(() => { setVolume(metrics.volume); }, [metrics.volume]);

  const debouncedControl = useDebouncedControl(onControl);

  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      padding: 'clamp(12px, 2.5vmin, 32px)',
      gap: 'clamp(12px, 2.5vmin, 28px)',
      overflow: 'hidden',
    }}>
      <div style={{ fontSize: 'var(--fs-sub)', color: 'var(--text-secondary)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>
        Contrôles rapides
      </div>

      {/* Brightness */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5vmin' }}>
          <div style={labelStyle}>☀ Luminosité</div>
          <div style={{ fontSize: 'var(--fs-num)', fontWeight: 700, color: 'var(--blue)', fontVariantNumeric: 'tabular-nums' }}>
            {brightness}%
          </div>
        </div>
        <input
          className="big-range"
          type="range" min={1} max={100} value={brightness}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            setBrightness(v);
            debouncedControl('set-brightness', v);
          }}
        />
      </div>

      {/* Volume */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1.5vmin' }}>
          <div style={labelStyle}>🔊 Volume</div>
          <div style={{ fontSize: 'var(--fs-num)', fontWeight: 700, color: 'var(--blue)', fontVariantNumeric: 'tabular-nums' }}>
            {volume}%
          </div>
        </div>
        <input
          className="big-range"
          type="range" min={0} max={100} value={volume}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            setVolume(v);
            debouncedControl('set-volume', v);
          }}
        />
      </div>

      {/* Power mode */}
      <div style={cardStyle}>
        <div style={{ ...labelStyle, marginBottom: '1.2vmin' }}>Mode d'alimentation</div>
        <PowerModeSegment current={metrics.powerProfile} onSelect={onControl} />
      </div>

      {/* Quick temp info */}
      <div style={{ ...cardStyle, flexDirection: 'row', gap: '4vmin', flexWrap: 'wrap', flexShrink: 0 }}>
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
        <div>
          <div style={labelStyle}>RAM</div>
          <div style={{ fontSize: 'var(--fs-num)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {metrics.memory.percent}%
          </div>
        </div>
        <div>
          <div style={labelStyle}>Disque</div>
          <div style={{ fontSize: 'var(--fs-num)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {metrics.disk.percent}%
          </div>
        </div>
      </div>
    </div>
  );
}
