import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import { getCpuUsage, getCpuFreqMHz } from './metrics/cpu';
import { getMemoryInfo } from './metrics/memory';
import { getCpuTempC, getGpuTempC } from './metrics/thermal';
import { getGpuInfo } from './metrics/gpu';
import { getNvidiaInfo, startNvidiaPolling } from './metrics/nvidia';
import { getNetworkSpeed } from './metrics/network';
import { getFanRPM } from './metrics/fans';
import { detectHardware, getHardware } from './metrics/hardware';
import { startWeatherPolling, getWeather } from './metrics/weather';
import { startSlowPolling, getSlowState, patchSlowState } from './slowState';
import { setPowerProfile, PowerProfile } from './controls/power';
import { setBrightness } from './controls/brightness';
import { setVolume } from './controls/volume';

const PORT = 3001;
// Kiosk local uniquement : on n'expose pas les contrôles (alim/luminosité/volume)
// au réseau. HOST=0.0.0.0 possible via env si accès distant volontaire.
const HOST = process.env.HOST || '127.0.0.1';

const app = express();
app.use(express.json());

app.post('/control', async (req, res) => {
  const { action, value } = req.body as { action: string; value?: unknown };
  try {
    switch (action) {
      case 'set-power-profile':
        await setPowerProfile(value as PowerProfile);
        patchSlowState({ powerProfile: value as PowerProfile });
        break;
      case 'set-brightness':
        await setBrightness(value as number);
        patchSlowState({ brightness: value as number });
        break;
      case 'set-volume':
        await setVolume(value as number);
        patchSlowState({ volume: value as number });
        break;
      default:
        return res.status(400).json({ error: 'Unknown action' });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// Servir le frontend buildé en statique (production / kiosk).
// FRONTEND_DIST permet à un paquet RPM de pointer vers /opt/.../frontend/dist.
// Sinon : process.cwd() = backend/ (WorkingDirectory du service systemd).
const frontendDist = process.env.FRONTEND_DIST || path.resolve(process.cwd(), '../frontend/dist');
console.log(`Frontend dist path: ${frontendDist} (exists: ${fs.existsSync(frontendDist)})`);

if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (_req, res) => res.sendFile(path.join(frontendDist, 'index.html')));
} else {
  app.get('/', (_req, res) =>
    res
      .status(503)
      .send('Frontend non buildé. Lancez : npm run build --prefix frontend && npm run build --prefix backend')
  );
}

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

function collectMetrics() {
  const slow = getSlowState();
  return {
    hardware: getHardware(),
    cpu: { usagePercent: getCpuUsage(), freqMHz: getCpuFreqMHz(), tempC: getCpuTempC() },
    memory: getMemoryInfo(),
    gpu: { ...getGpuInfo(), tempC: getGpuTempC() },
    egpu: getNvidiaInfo(),
    disk: slow.disk,
    network: getNetworkSpeed(),
    fans: getFanRPM(),
    powerProfile: slow.powerProfile,
    brightness: slow.brightness,
    volume: slow.volume,
    weather: getWeather(),
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

void detectHardware();
startNvidiaPolling();
startSlowPolling();
startWeatherPolling();

server.listen(PORT, HOST, () => {
  console.log(`Compagnion Monitor backend listening on http://${HOST}:${PORT}`);
});
