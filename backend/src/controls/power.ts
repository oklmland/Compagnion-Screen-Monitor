import { execAsync } from '../util/exec';

export type PowerProfile = 'power-saver' | 'balanced' | 'performance';

// Fedora 41+ utilise tuned-ppd au lieu de power-profiles-daemon. Selon l'install,
// la commande powerprofilesctl peut être absente : on bascule alors sur tuned-adm.
let backend: 'ppd' | 'tuned' | 'none' | null = null;

async function has(cmd: string): Promise<boolean> {
  try { await execAsync(`command -v ${cmd}`); return true; } catch { return false; }
}

async function detectBackend(): Promise<'ppd' | 'tuned' | 'none'> {
  if (backend) return backend;
  if (await has('powerprofilesctl')) backend = 'ppd';
  else if (await has('tuned-adm')) backend = 'tuned';
  else backend = 'none';
  console.log(`[power] backend détecté : ${backend}`);
  return backend;
}

// Correspondance profils <-> profils tuned
const toTuned: Record<PowerProfile, string> = {
  'power-saver': 'powersave',
  'balanced': 'balanced',
  'performance': 'throughput-performance',
};
const fromTuned = (name: string): PowerProfile => {
  if (name.includes('powersave')) return 'power-saver';
  if (name.includes('performance')) return 'performance';
  return 'balanced';
};

export async function getPowerProfile(): Promise<PowerProfile> {
  const b = await detectBackend();
  try {
    if (b === 'ppd') {
      const out = await execAsync('powerprofilesctl get');
      if (out === 'power-saver' || out === 'balanced' || out === 'performance') return out;
    } else if (b === 'tuned') {
      const out = await execAsync('tuned-adm active'); // "Current active profile: balanced"
      const m = out.match(/:\s*(.+)\s*$/);
      if (m) return fromTuned(m[1].trim());
    }
  } catch { /* indisponible */ }
  return 'balanced';
}

export async function setPowerProfile(profile: PowerProfile): Promise<void> {
  const b = await detectBackend();
  if (b === 'ppd') {
    await execAsync(`powerprofilesctl set ${profile}`);
  } else if (b === 'tuned') {
    await execAsync(`tuned-adm profile ${toTuned[profile]}`);
  } else {
    throw new Error('Aucun gestionnaire de profil (powerprofilesctl / tuned-adm) trouvé');
  }
  console.log(`[power] profil réglé sur ${profile} via ${b}`);
}
