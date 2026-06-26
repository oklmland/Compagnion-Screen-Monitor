import { useState } from 'react';
import { SystemMetrics } from '../hooks/useSystemMetrics';
import CpuWidget from './CpuWidget';
import GpuWidget from './GpuWidget';
import EgpuWidget from './EgpuWidget';
import RamWidget from './RamWidget';
import DiskWidget from './DiskWidget';
import LayoutPickerModal, { Layout } from './LayoutPickerModal';

interface Props {
  metrics: SystemMetrics;
}

// gridAutoRows (au lieu de gridTemplateRows fixe) pour s'adapter à 4 ou 5
// widgets selon que l'eGPU Oculink est branché ou non.
function gridStyleFor(layout: Layout): React.CSSProperties {
  switch (layout) {
    case '2x2': return { display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: 6 };
    case '1col': return { display: 'grid', gridTemplateColumns: '1fr', gridAutoRows: '1fr', gap: 6 };
    case '3col': return { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gridAutoRows: '1fr', gap: 6 };
    case 'left-big': return { display: 'grid', gridTemplateColumns: '2fr 1fr', gridAutoRows: '1fr', gap: 6 };
    case '2col': return { display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: 6 };
    case '1row': return { display: 'grid', gridAutoFlow: 'column', gridAutoColumns: '1fr', gap: 6 };
    default: return { display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: 6 };
  }
}

export default function MonitorGrid({ metrics }: Props) {
  const [layout, setLayout] = useState<Layout>('2x2');
  const [showPicker, setShowPicker] = useState(false);

  return (
    <>
      <div style={{ flex: 1, padding: '6px 12px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <button
            onClick={() => setShowPicker(true)}
            style={{
              background: '#1a1a1a',
              border: '1px solid var(--card-border)',
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 11,
              color: 'var(--text-secondary)',
            }}
          >
            &#9638; Disposition
          </button>
        </div>
        <div style={{ ...gridStyleFor(layout), flex: 1 }}>
          <CpuWidget
            name={metrics.hardware.cpuName}
            usagePercent={metrics.cpu.usagePercent}
            freqMHz={metrics.cpu.freqMHz}
            tempC={metrics.cpu.tempC}
          />
          {metrics.egpu.present && (
            <EgpuWidget
              name={metrics.egpu.name}
              busyPercent={metrics.egpu.busyPercent}
              vramUsedMB={metrics.egpu.vramUsedMB}
              vramTotalMB={metrics.egpu.vramTotalMB}
              tempC={metrics.egpu.tempC}
              powerW={metrics.egpu.powerW}
            />
          )}
          <GpuWidget
            name={metrics.hardware.gpuName}
            busyPercent={metrics.gpu.busyPercent}
            vramUsedMB={metrics.gpu.vramUsedMB}
            vramTotalMB={metrics.gpu.vramTotalMB}
            tempC={metrics.gpu.tempC}
          />
          <RamWidget
            usedGB={metrics.memory.usedGB}
            totalGB={metrics.memory.totalGB}
            percent={metrics.memory.percent}
          />
          <DiskWidget
            name={metrics.hardware.diskName}
            usedGB={metrics.disk.usedGB}
            totalGB={metrics.disk.totalGB}
            percent={metrics.disk.percent}
          />
        </div>
      </div>
      {showPicker && (
        <LayoutPickerModal
          current={layout}
          onSelect={(l) => { setLayout(l); setShowPicker(false); }}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
