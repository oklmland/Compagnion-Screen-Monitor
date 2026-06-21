import { execSync } from 'child_process';

export interface DiskInfo {
  totalGB: number;
  usedGB: number;
  percent: number;
}

export function getDiskInfo(): DiskInfo {
  try {
    const out = execSync("df -k / | tail -1", { timeout: 2000 }).toString().trim();
    const parts = out.split(/\s+/);
    const totalKB = parseInt(parts[1]) || 0;
    const usedKB = parseInt(parts[2]) || 0;
    const totalGB = Math.round(totalKB / 1024 / 1024);
    const usedGB = Math.round((usedKB / 1024 / 1024) * 10) / 10;
    const percent = totalKB > 0 ? Math.round((usedKB / totalKB) * 100) : 0;
    return { totalGB, usedGB, percent };
  } catch {
    return { totalGB: 0, usedGB: 0, percent: 0 };
  }
}
