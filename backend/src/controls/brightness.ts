import { execSync } from 'child_process';

export function getBrightness(): number {
  try {
    const out = execSync('brightnessctl get', { timeout: 2000 }).toString().trim();
    const max = execSync('brightnessctl max', { timeout: 2000 }).toString().trim();
    return Math.round((parseInt(out) / parseInt(max)) * 100);
  } catch {
    return 100;
  }
}

export function setBrightness(percent: number): void {
  const clamped = Math.max(1, Math.min(100, percent));
  execSync(`brightnessctl set ${clamped}%`, { timeout: 2000 });
}
