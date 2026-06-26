import { execAsync } from '../util/exec';

export async function getBrightness(): Promise<number> {
  try {
    const [cur, max] = await Promise.all([
      execAsync('brightnessctl get'),
      execAsync('brightnessctl max'),
    ]);
    const m = parseInt(max);
    if (m > 0) return Math.round((parseInt(cur) / m) * 100);
  } catch { /* brightnessctl absent ou pas de backlight */ }
  return 100;
}

export async function setBrightness(percent: number): Promise<void> {
  const clamped = Math.max(1, Math.min(100, Math.round(percent)));
  await execAsync(`brightnessctl set ${clamped}%`);
}
