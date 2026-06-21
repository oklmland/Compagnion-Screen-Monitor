import { useSystemMetrics } from './hooks/useSystemMetrics';
import ClockSection from './components/ClockSection';
import MonitorGrid from './components/MonitorGrid';
import BottomBar from './components/BottomBar';

export default function App() {
  const { metrics, connected, sendControl } = useSystemMetrics();

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg)',
      overflow: 'hidden',
    }}>
      <ClockSection metrics={metrics} onControl={sendControl} />
      <MonitorGrid metrics={metrics} />
      <BottomBar metrics={metrics} onControl={sendControl} connected={connected} />
    </div>
  );
}
