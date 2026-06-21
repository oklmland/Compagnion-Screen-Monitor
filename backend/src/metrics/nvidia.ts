import { exec } from 'child_process';

export interface NvidiaInfo {
  present: boolean;
  name: string;
  busyPercent: number;
  vramUsedMB: number;
  vramTotalMB: number;
  vramPercent: number;
  tempC: number;
  powerW: number;
}

const ABSENT: NvidiaInfo = {
  present: false,
  name: '',
  busyPercent: 0,
  vramUsedMB: 0,
  vramTotalMB: 0,
  vramPercent: 0,
  tempC: 0,
  powerW: 0,
};

let cache: NvidiaInfo = { ...ABSENT };
let nvidiaSmiMissing = false;

// nvidia-smi peut prendre 100-300ms : on le lance en arrière-plan toutes les
// secondes et on sert la dernière valeur en cache, sans bloquer la boucle 500ms.
function refresh(): void {
  if (nvidiaSmiMissing) return;
  const query = 'name,utilization.gpu,memory.used,memory.total,temperature.gpu,power.draw';
  exec(
    `nvidia-smi --query-gpu=${query} --format=csv,noheader,nounits`,
    { timeout: 2000 },
    (err, stdout) => {
      if (err) {
        // Code 127 / ENOENT => binaire absent : on arrête de réessayer.
        if ((err as NodeJS.ErrnoException).code === 'ENOENT' || /not found/i.test(err.message)) {
          nvidiaSmiMissing = true;
        }
        // eGPU débranché (Oculink hotplug) ou pilote non chargé => considéré absent.
        cache = { ...ABSENT };
        return;
      }
      // On prend la première ligne (premier GPU NVIDIA détecté = la 4070 eGPU).
      const line = stdout.trim().split('\n')[0];
      if (!line) {
        cache = { ...ABSENT };
        return;
      }
      const parts = line.split(',').map((s) => s.trim());
      const [name, util, memUsed, memTotal, temp, power] = parts;
      const vramUsedMB = parseInt(memUsed) || 0;
      const vramTotalMB = parseInt(memTotal) || 0;
      cache = {
        present: true,
        name: name || 'NVIDIA GPU',
        busyPercent: parseInt(util) || 0,
        vramUsedMB,
        vramTotalMB,
        vramPercent: vramTotalMB > 0 ? Math.round((vramUsedMB / vramTotalMB) * 100) : 0,
        tempC: parseInt(temp) || 0,
        powerW: Math.round(parseFloat(power) || 0),
      };
    }
  );
}

export function startNvidiaPolling(): void {
  refresh();
  setInterval(refresh, 1000);
}

export function getNvidiaInfo(): NvidiaInfo {
  return cache;
}
