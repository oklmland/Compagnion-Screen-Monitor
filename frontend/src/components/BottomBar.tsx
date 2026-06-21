import { useState } from 'react';
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
  const [localBrightness, setLocalBrightness] = useState(metrics.brightness);
  const [localVolume, setLocalVolume] = useState(metrics.volume);

  const fanRPM = metrics.fans.length > 0 ? Math.round(metrics.fans[0]) : null;

  const handleBrightnessChange = (v: number) => {
    setLocalBrightness(v);
    onControl('set-brightness', v);
  };

  const handleVolumeChange = (v: number) => {
    setLocalVolume(v);
    onControl('set-volume', v);
  };

  return (
    <>
      <div style={{
        borderTop: '1px solid var(--card-border)',
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        background: 'var(--card)',
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 12 }}>&#8593;</span>
          <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>
            {metrics.network.txMBs.toFixed(1)}M/s
          </span>
          <span style={{ fontSize: 12, marginLeft: 4 }}>&#8595;</span>
          <span style={{ fontSize: 12, fontVariantNumeric: 'tabular-nums', color: 'var(--text-secondary)' }}>
            {metrics.network.rxMBs.toFixed(1)}M/s
          </span>
          {fanRPM !== null && (
            <>
              <span style={{ fontSize: 12, marginLeft: 6 }}>&#10052;</span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                {fanRPM}r/m
              </span>
            </>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
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
            ...iconBtnStyle,
            width: 8, height: 8, borderRadius: '50%', padding: 0, margin: 'auto 4px',
            background: connected ? 'var(--green)' : 'var(--red)',
            display: 'inline-block',
          }} />
        </div>
      </div>

      {showBrightness && (
        <BrightnessSlider
          value={localBrightness}
          onChange={handleBrightnessChange}
          onClose={() => setShowBrightness(false)}
        />
      )}
      {showVolume && (
        <VolumeSlider
          value={localVolume}
          onChange={handleVolumeChange}
          onClose={() => setShowVolume(false)}
        />
      )}
    </>
  );
}

const iconBtnStyle: React.CSSProperties = {
  width: 36, height: 36,
  background: '#1a1a1a',
  border: '1px solid var(--card-border)',
  borderRadius: 8,
  fontSize: 16,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: 'var(--text-secondary)',
};
