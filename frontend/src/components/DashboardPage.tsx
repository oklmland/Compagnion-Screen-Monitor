import { SystemMetrics } from '../hooks/useSystemMetrics';
import ClockSection from './ClockSection';
import MonitorGrid from './MonitorGrid';
import BottomBar from './BottomBar';

interface Props {
  metrics: SystemMetrics;
  connected: boolean;
  onControl: (action: string, value?: unknown) => void;
}

export default function DashboardPage({ metrics, connected, onControl }: Props) {
  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      <ClockSection metrics={metrics} onControl={onControl} />
      <MonitorGrid metrics={metrics} />
      <BottomBar metrics={metrics} onControl={onControl} connected={connected} />
    </div>
  );
}
