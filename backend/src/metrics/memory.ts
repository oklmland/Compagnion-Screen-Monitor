import fs from 'fs';

export interface MemoryInfo {
  totalGB: number;
  usedGB: number;
  percent: number;
}

export function getMemoryInfo(): MemoryInfo {
  const meminfo = fs.readFileSync('/proc/meminfo', 'utf-8');
  const get = (key: string): number => {
    const m = meminfo.match(new RegExp(`^${key}:\\s+(\\d+)`, 'm'));
    return m ? parseInt(m[1]) : 0;
  };
  const totalKB = get('MemTotal');
  const availKB = get('MemAvailable');
  const usedKB = totalKB - availKB;
  const totalGB = Math.round((totalKB / 1024 / 1024) * 10) / 10;
  const usedGB = Math.round((usedKB / 1024 / 1024) * 10) / 10;
  const percent = totalKB > 0 ? Math.round((usedKB / totalKB) * 100) : 0;
  return { totalGB, usedGB, percent };
}
