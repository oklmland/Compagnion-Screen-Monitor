import { execAsync } from '../util/exec';

export async function getVolume(): Promise<number> {
  try {
    const out = await execAsync('wpctl get-volume @DEFAULT_AUDIO_SINK@');
    const m = out.match(/Volume: ([\d.]+)/);
    if (m) return Math.round(parseFloat(m[1]) * 100);
  } catch { /* wpctl absent */ }
  return 50;
}

export async function setVolume(percent: number): Promise<void> {
  const clamped = Math.max(0, Math.min(100, Math.round(percent)));
  await execAsync(`wpctl set-volume @DEFAULT_AUDIO_SINK@ ${clamped}%`);
}
