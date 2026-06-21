import fs from 'fs';
import path from 'path';

function findAmdgpuCard(): string | null {
  try {
    const base = '/sys/class/drm';
    const entries = fs.readdirSync(base);
    for (const entry of entries) {
      if (!entry.match(/^card\d+$/)) continue;
      const busyPath = path.join(base, entry, 'device', 'gpu_busy_percent');
      if (fs.existsSync(busyPath)) return entry;
    }
  } catch { /* skip */ }
  return null;
}

export interface GpuInfo {
  busyPercent: number;
  vramUsedMB: number;
  vramTotalMB: number;
  vramPercent: number;
}

export function getGpuInfo(): GpuInfo {
  const card = findAmdgpuCard();
  if (!card) return { busyPercent: 0, vramUsedMB: 0, vramTotalMB: 0, vramPercent: 0 };

  const base = `/sys/class/drm/${card}/device`;
  const readInt = (file: string): number => {
    try { return parseInt(fs.readFileSync(path.join(base, file), 'utf-8').trim()); }
    catch { return 0; }
  };

  const busyPercent = readInt('gpu_busy_percent');
  const vramUsedBytes = readInt('mem_info_vram_used');
  const vramTotalBytes = readInt('mem_info_vram_total');
  const vramUsedMB = Math.round(vramUsedBytes / 1024 / 1024);
  const vramTotalMB = Math.round(vramTotalBytes / 1024 / 1024);
  const vramPercent = vramTotalMB > 0 ? Math.round((vramUsedMB / vramTotalMB) * 100) : 0;

  return { busyPercent, vramUsedMB, vramTotalMB, vramPercent };
}
