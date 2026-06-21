import fs from 'fs';

interface CpuSample {
  user: number;
  nice: number;
  system: number;
  idle: number;
  iowait: number;
  irq: number;
  softirq: number;
  total: number;
}

let prevSample: CpuSample | null = null;

function readCpuStat(): CpuSample {
  const stat = fs.readFileSync('/proc/stat', 'utf-8');
  const line = stat.split('\n')[0];
  const parts = line.split(/\s+/);
  const [, user, nice, system, idle, iowait, irq, softirq] = parts.map(Number);
  return {
    user, nice, system, idle, iowait: iowait || 0, irq: irq || 0, softirq: softirq || 0,
    total: user + nice + system + idle + (iowait || 0) + (irq || 0) + (softirq || 0),
  };
}

export function getCpuUsage(): number {
  const curr = readCpuStat();
  if (!prevSample) {
    prevSample = curr;
    return 0;
  }
  const totalDelta = curr.total - prevSample.total;
  const idleDelta = curr.idle - prevSample.idle;
  prevSample = curr;
  if (totalDelta === 0) return 0;
  return Math.round(((totalDelta - idleDelta) / totalDelta) * 100);
}

export function getCpuFreqMHz(): number {
  try {
    const freq = fs.readFileSync('/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq', 'utf-8');
    return Math.round(parseInt(freq.trim()) / 1000);
  } catch {
    return 0;
  }
}
