import { useRef } from 'react';
import { useSystemMetrics } from './hooks/useSystemMetrics';
import DashboardPage from './components/DashboardPage';
import ClockPage from './components/ClockPage';
import NetworkPage from './components/NetworkPage';
import ControlsPage from './components/ControlsPage';
import PageDots from './components/PageDots';

export default function App() {
  const { metrics, connected, sendControl } = useSystemMetrics();
  const scrollRef = useRef<HTMLDivElement>(null);

  const goToPage = (i: number) => {
    scrollRef.current?.scrollTo({ left: i * window.innerWidth, behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
      <div ref={scrollRef} className="page-scroll-container">
        <div className="page-slot">
          <DashboardPage metrics={metrics} connected={connected} onControl={sendControl} />
        </div>
        <div className="page-slot">
          <ClockPage metrics={metrics} />
        </div>
        <div className="page-slot">
          <NetworkPage metrics={metrics} />
        </div>
        <div className="page-slot">
          <ControlsPage metrics={metrics} onControl={sendControl} />
        </div>
      </div>
      <PageDots total={4} scrollRef={scrollRef} onGoTo={goToPage} />
    </div>
  );
}
