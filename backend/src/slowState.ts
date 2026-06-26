import { getPowerProfile, PowerProfile } from './controls/power';
import { getBrightness } from './controls/brightness';
import { getVolume } from './controls/volume';
import { getDiskInfo, DiskInfo } from './metrics/disk';

// État qui change rarement : on l'interroge en async toutes les 2s au lieu de
// lancer 5 execSync bloquants dans la boucle WebSocket à 500ms.
export interface SlowState {
  powerProfile: PowerProfile;
  brightness: number;
  volume: number;
  disk: DiskInfo;
}

let cache: SlowState = {
  powerProfile: 'balanced',
  brightness: 100,
  volume: 50,
  disk: { totalGB: 0, usedGB: 0, percent: 0 },
};

let refreshing = false;

async function refresh(): Promise<void> {
  if (refreshing) return;
  refreshing = true;
  try {
    const [powerProfile, brightness, volume, disk] = await Promise.all([
      getPowerProfile(),
      getBrightness(),
      getVolume(),
      getDiskInfo(),
    ]);
    cache = { powerProfile, brightness, volume, disk };
  } finally {
    refreshing = false;
  }
}

export function startSlowPolling(): void {
  void refresh();
  setInterval(() => void refresh(), 2000);
}

export function getSlowState(): SlowState {
  return cache;
}

// Mise à jour optimiste après une commande utilisateur (luminosité/volume/profil)
// pour que l'UI réagisse immédiatement sans attendre le prochain refresh.
export function patchSlowState(patch: Partial<SlowState>): void {
  cache = { ...cache, ...patch };
}
