import { execAsync } from '../util/exec';

export interface DiskInfo {
  totalGB: number;
  usedGB: number;
  percent: number;
}

export async function getDiskInfo(): Promise<DiskInfo> {
  try {
    const out = await execAsync('df -k /');
    const line = out.split('\n').slice(-1)[0];
    const parts = line.split(/\s+/);
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
