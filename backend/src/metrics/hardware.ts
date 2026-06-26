import fs from 'fs';
import { execAsync } from '../util/exec';

// Noms réels du matériel, détectés une fois au démarrage (ils ne changent pas).
export interface HardwareInfo {
  cpuName: string;
  gpuName: string;
  diskName: string;
}

let cache: HardwareInfo = { cpuName: 'CPU', gpuName: 'GPU', diskName: 'Disque' };

function readCpuName(): string {
  try {
    const info = fs.readFileSync('/proc/cpuinfo', 'utf-8');
    const m = info.match(/model name\s*:\s*(.+)/);
    if (m) {
      return m[1]
        .replace(/\(R\)|\(TM\)|\(tm\)/g, '')
        .replace(/\bCPU\b|\bProcessor\b/g, '')
        .replace(/\bw\/\s+Radeon[^,]*/gi, '')
        .replace(/@.*$/, '')
        .replace(/\s+/g, ' ')
        .trim();
    }
  } catch { /* skip */ }
  return 'CPU';
}

async function readGpuName(): Promise<string> {
  // 1) Beaucoup d'APU AMD annoncent le GPU dans le nom CPU : "... w/ Radeon 780M Graphics"
  try {
    const info = fs.readFileSync('/proc/cpuinfo', 'utf-8');
    const m = info.match(/model name\s*:.*?\b(Radeon[^\n]*?Graphics)/i);
    if (m) return m[1].replace(/\s+/g, ' ').trim(); // -> "Radeon 780M Graphics"
  } catch { /* skip */ }
  // 2) Sinon lspci. On évite les noms de code (HawkPoint, Phoenix, Device xxxx).
  try {
    const out = await execAsync('lspci -mm');
    const line = out.split('\n').find((l) => /VGA compatible controller|Display controller/i.test(l));
    if (line) {
      const fields = (line.match(/"([^"]*)"/g) || []).map((s) => s.replace(/"/g, ''));
      const device = fields[2] || '';
      const cleaned = device.replace(/\[.*?\]/g, '').replace(/\s+/g, ' ').trim();
      if (cleaned && !/^Device\s|HawkPoint|Phoenix|Rembrandt|Granite/i.test(cleaned)) return cleaned;
    }
  } catch { /* lspci absent */ }
  return 'GPU';
}

async function readDiskName(): Promise<string> {
  // Modèle du disque qui porte la racine /
  try {
    const src = await execAsync('findmnt -no SOURCE /');
    const model = await execAsync(`lsblk -ndo MODEL ${src}`);
    if (model) return model.trim();
  } catch { /* skip */ }
  // Fallback : premier NVMe trouvé
  try {
    const nvme = fs.readdirSync('/sys/block').find((d) => d.startsWith('nvme'));
    if (nvme) {
      const model = fs.readFileSync(`/sys/block/${nvme}/device/model`, 'utf-8').trim();
      if (model) return model;
    }
  } catch { /* skip */ }
  return 'SSD';
}

export async function detectHardware(): Promise<void> {
  const [gpuName, diskName] = await Promise.all([readGpuName(), readDiskName()]);
  cache = { cpuName: readCpuName(), gpuName, diskName };
}

export function getHardware(): HardwareInfo {
  return cache;
}
