import { useState, useRef, useCallback } from 'react';
import { SystemMetrics } from '../hooks/useSystemMetrics';
import BrightnessSlider from './BrightnessSlider';
import VolumeSlider from './VolumeSlider';

interface Props {
  metrics: SystemMetrics;
  onControl: (action: string, value?: unknown) => void;
  connected: boolean;
}

export default function BottomBar({ metrics, onControl, connected }: Props) {
  const [showBrightness, setShowBrightness] = useState(false);
  const [showVolume, setShowVolume] = useState(false);

  const fanRPM = metrics.fans.length > 0 ? Math.round(metrics.fans[0]) : null;

  // Debounce trailing : pendant qu'on glisse le slider, on n'envoie la commande
  // (qui lance brightnessctl/wpctl) qu'après 80ms d'immobilité, au lieu de
  // spammer un sous-processus à chaque pixel.
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const debouncedControl = useCallback((action: string, value: number) => {
    clearTimeout(timers.current[action]);
    timers.current[action] = setTimeout(() => onControl(action, value), 80);
  }, [onControl]);

  const handleBrightnessChange = (v: number) => debouncedControl('set-brightness', v);
  const handleVolumeChange = (v: number) => debouncedControl('set-volume', v);

  return (
    <>
      <div style={{
        borderTop: '1px solid var(--card-border)',
        padding: '1.2vmin 2vmin',
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        background: 'var(--card)',
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1vmin', fontSize: 'var(--fs-sub)' }}>
          <span>&#8593;</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>
            {metrics.network.txMBs.toFixed(1)}M/s
          </span>
          <span style={{ marginLeft: '0.6vmin' }}>&#8595;</span>
          <span style={{ fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>
            {metrics.network.rxMBs.toFixed(1)}M/s
          </span>
          {fanRPM !== null && (
            <>
              <span style={{ marginLeft: '1vmin' }}>&#10052;</span>
              <span style={{ color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                {fanRPM}r/m
              </span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: '1vmin' }}>
          <button
            onClick={() => setShowBrightness(true)}
            style={iconBtnStyle}
            aria-label="Luminosité"
          >
            &#9728;
          </button>
          <button
            onClick={() => setShowVolume(true)}
            style={iconBtnStyle}
            aria-label="Volume"
          >
            &#128266;
          </button>
          <div style={{
            width: '1.4vmin', height: '1.4vmin', minWidth: 8, minHeight: 8,
            borderRadius: '50%', margin: 'auto 0.6vmin',
            background: connected ? 'var(--green)' : 'var(--red)',
            alignSelf: 'center',
          }} />
        </div>
      </div>

      {showBrightness && (
        <BrightnessSlider
          initial={metrics.brightness}
          onChange={handleBrightnessChange}
          onClose={() => setShowBrightness(false)}
        />
      )}
      {showVolume && (
        <VolumeSlider
          initial={metrics.volume}
          onChange={handleVolumeChange}
          onClose={() => setShowVolume(false)}
        />
      )}
    </>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: 'clamp(34px, 6.5vmin, 64px)',
  height: 'clamp(34px, 6.5vmin, 64px)',
  background: '#1a1a1a',
  border: '1px solid var(--card-border)',
  borderRadius: 'var(--radius-sm)',
  fontSize: 'var(--fs-icon)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--text-secondary)',
};
