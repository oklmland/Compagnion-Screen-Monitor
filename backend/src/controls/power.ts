import { execAsync } from '../util/exec';

export type PowerProfile = 'power-saver' | 'balanced' | 'performance';

export async function getPowerProfile(): Promise<PowerProfile> {
  try {
    const out = await execAsync('powerprofilesctl get');
    if (out === 'power-saver' || out === 'balanced' || out === 'performance') return out;
  } catch { /* power-profiles-daemon absent */ }
  return 'balanced';
}

export async function setPowerProfile(profile: PowerProfile): Promise<void> {
  await execAsync(`powerprofilesctl set ${profile}`);
}
