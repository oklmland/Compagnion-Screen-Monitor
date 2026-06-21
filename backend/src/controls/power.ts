import { execSync } from 'child_process';

export type PowerProfile = 'power-saver' | 'balanced' | 'performance';

export function getPowerProfile(): PowerProfile {
  try {
    const out = execSync('powerprofilesctl get', { timeout: 2000 }).toString().trim();
    if (out === 'power-saver' || out === 'balanced' || out === 'performance') return out;
    return 'balanced';
  } catch {
    return 'balanced';
  }
}

export function setPowerProfile(profile: PowerProfile): void {
  execSync(`powerprofilesctl set ${profile}`, { timeout: 2000 });
}
