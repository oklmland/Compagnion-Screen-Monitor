import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { getCpuUsage, getCpuFreqMHz } from './metrics/cpu';
import { getMemoryInfo } from './metrics/memory';
import { getCpuTempC, getGpuTempC } from './metrics/thermal';
import { getGpuInfo } from './metrics/gpu';
import { getNvidiaInfo, startNvidiaPolling } from './metrics/nvidia';
import { getNetworkSpeed } from './metrics/network';
import { getDiskInfo } from './metrics/disk';
import { getFanRPM } from './metrics/fans';
import { getPowerProfile, setPowerProfile, PowerProfile } from './controls/power';
import { getBrightness, setBrightness } from './controls/brightness';
import { getVolume, setVolume } from './controls/volume';

const PORT = 3001;

const app = express();
app.use(express.json());
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.options('*', (_req, res) => res.sendStatus(204));

app.post('/control', async (req, res) => {
  const { action, value } = req.body as { action: string; value?: unknown };
  try {
    switch (action) {
      case 'set-power-profile':
        setPowerProfile(value as PowerProfile);
        break;
      case 'set-brightness':
        setBrightness(value as number);
        break;
      case 'set-volume':
        setVolume(value as number);
        break;
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function collectMetrics() {
  const cpuUsage = getCpuUsage();
  const cpuFreqMHz = getCpuFreqMHz();
  const cpuTempC = getCpuTempC();
  const memory = getMemoryInfo();
  const gpuInfo = getGpuInfo();
  const gpuTempC = getGpuTempC();
  const egpu = getNvidiaInfo();
  const network = getNetworkSpeed();
  const disk = getDiskInfo();
  const fans = getFanRPM();
  const powerProfile = getPowerProfile();
  const brightness = getBrightness();
  const volume = getVolume();

  return {
    cpu: { usagePercent: cpuUsage, freqMHz: cpuFreqMHz, tempC: cpuTempC },
    memory,
    gpu: { ...gpuInfo, tempC: gpuTempC },
    egpu,
    disk,
    network,
    fans,
    powerProfile,
    brightness,
    volume,
    uptime: Math.floor(process.uptime()),
  };
}

setInterval(() => {
  if (wss.clients.size === 0) return;
  const data = JSON.stringify(collectMetrics());
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) client.send(data);
  });
}, 500);

wss.on('connection', (ws) => {
  ws.send(JSON.stringify(collectMetrics()));
});

startNvidiaPolling();

server.listen(PORT, () => {
  console.log(`Compagnion Monitor backend listening on http://localhost:${PORT}`);
});
