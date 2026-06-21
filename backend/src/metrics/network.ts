import fs from 'fs';

interface NetSample {
  rx: number;
  tx: number;
  ts: number;
}

let prevNet: NetSample | null = null;

function readNetStats(): { rx: number; tx: number } {
  const content = fs.readFileSync('/proc/net/dev', 'utf-8');
  let rx = 0, tx = 0;
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('Inter') || trimmed.startsWith('face')) continue;
    const parts = trimmed.split(/\s+/);
    const iface = parts[0].replace(':', '');
    if (iface === 'lo') continue;
    rx += parseInt(parts[1]) || 0;
    tx += parseInt(parts[9]) || 0;
  }
  return { rx, tx };
}

export interface NetworkSpeed {
  rxMBs: number;
  txMBs: number;
}

export function getNetworkSpeed(): NetworkSpeed {
  const curr = readNetStats();
  const now = Date.now();
  if (!prevNet) {
    prevNet = { ...curr, ts: now };
    return { rxMBs: 0, txMBs: 0 };
  }
  const dt = (now - prevNet.ts) / 1000;
  const rxMBs = dt > 0 ? Math.round(((curr.rx - prevNet.rx) / dt / 1024 / 1024) * 10) / 10 : 0;
  const txMBs = dt > 0 ? Math.round(((curr.tx - prevNet.tx) / dt / 1024 / 1024) * 10) / 10 : 0;
  prevNet = { ...curr, ts: now };
  return { rxMBs: Math.max(0, rxMBs), txMBs: Math.max(0, txMBs) };
}
