import { execSync } from 'child_process';

export function getVolume(): number {
  try {
    const out = execSync('wpctl get-volume @DEFAULT_AUDIO_SINK@', { timeout: 2000 }).toString().trim();
    const m = out.match(/Volume: ([\d.]+)/);
    return m ? Math.round(parseFloat(m[1]) * 100) : 50;
  } catch {
    return 50;
  }
}

export function setVolume(percent: number): void {
  const clamped = Math.max(0, Math.min(100, percent));
  execSync(`wpctl set-volume @DEFAULT_AUDIO_SINK@ ${clamped}%`, { timeout: 2000 });
}
