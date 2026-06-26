import { useState, useEffect, useRef, useCallback } from 'react';

export interface SystemMetrics {
  hardware: { cpuName: string; gpuName: string; diskName: string };
  cpu: { usagePercent: number; freqMHz: number; tempC: number };
  memory: { totalGB: number; usedGB: number; percent: number };
  gpu: { busyPercent: number; vramUsedMB: number; vramTotalMB: number; vramPercent: number; tempC: number };
  egpu: { present: boolean; name: string; busyPercent: number; vramUsedMB: number; vramTotalMB: number; vramPercent: number; tempC: number; powerW: number };
  disk: { totalGB: number; usedGB: number; percent: number };
  network: { rxMBs: number; txMBs: number };
  fans: number[];
  powerProfile: 'power-saver' | 'balanced' | 'performance';
  brightness: number;
  volume: number;
  weather: { available: boolean; city: string; currentC: number; minC: number; maxC: number; code: number };
  uptime: number;
}

const defaultMetrics: SystemMetrics = {
  hardware: { cpuName: 'CPU', gpuName: 'GPU', diskName: 'Disque' },
  cpu: { usagePercent: 0, freqMHz: 0, tempC: 0 },
  memory: { totalGB: 0, usedGB: 0, percent: 0 },
  gpu: { busyPercent: 0, vramUsedMB: 0, vramTotalMB: 0, vramPercent: 0, tempC: 0 },
  egpu: { present: false, name: '', busyPercent: 0, vramUsedMB: 0, vramTotalMB: 0, vramPercent: 0, tempC: 0, powerW: 0 },
  disk: { totalGB: 0, usedGB: 0, percent: 0 },
  network: { rxMBs: 0, txMBs: 0 },
  fans: [],
  powerProfile: 'balanced',
  brightness: 100,
  volume: 50,
  weather: { available: false, city: '', currentC: 0, minC: 0, maxC: 0, code: 0 },
  uptime: 0,
};

// En dev (Vite :5173) on se connecte directement au backend :3001.
// En prod (servi par le backend :3001) on utilise le même host:port.
const WS_URL = window.location.port === '5173'
  ? `ws://${window.location.hostname}:3001`
  : `ws://${window.location.host}`;

export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics>(defaultMetrics);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onmessage = (e) => {
      try { setMetrics(JSON.parse(e.data)); } catch { /* ignore */ }
    };
    ws.onclose = () => {
      setConnected(false);
      retryRef.current = setTimeout(connect, 2000);
    };
    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const sendControl = useCallback((action: string, value?: unknown) => {
    fetch('/control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, value }),
    }).catch(() => { /* backend indisponible : ignoré, l'UI reste réactive */ });
  }, []);

  return { metrics, connected, sendControl };
}
