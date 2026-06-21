# Compagnion Screen Monitor

Dashboard de monitoring système tactile pour **Aoostar G Flip 8845HS** — Fedora 44 / GNOME / Wayland.

Inspiré de l'interface tactile Minisforum AtomMan X7 Ti.

## Aperçu

- **Section haute** : horloge (3 styles), date, sélection du profil d'alimentation
- **Section milieu** : grille configurable — CPU, GPU Radeon 780M, RAM, SSD en temps réel
- **Section basse** : débit réseau, RPM ventilateur, contrôles luminosité/volume

## Prérequis

```bash
# Fedora
sudo dnf install nodejs brightnessctl pipewire-utils
# power-profiles-daemon est installé par défaut avec GNOME

# Pour un eGPU NVIDIA (ex. RTX 4070 en Oculink) : pilotes propriétaires + nvidia-smi
sudo dnf install akmod-nvidia xorg-x11-drv-nvidia-cuda   # via RPM Fusion
```

## GPU intégré + eGPU NVIDIA (Oculink)

Le dashboard détecte automatiquement les deux GPU :

- **iGPU Radeon 780M** (widget `GPU`) — lu via sysfs `amdgpu`
- **eGPU NVIDIA** (widget `eGPU`, badge OCULINK) — lu via `nvidia-smi` : usage %,
  VRAM, température et consommation (W)

L'eGPU n'apparaît que lorsqu'il est branché et que le pilote NVIDIA est chargé.
Le widget disparaît automatiquement si tu débranches l'Oculink à chaud (hotplug).
`nvidia-smi` est interrogé en arrière-plan (1×/s) pour ne pas ralentir le reste.

## Installation rapide

```bash
git clone https://github.com/oklmland/compagnion-screen-monitor.git
cd compagnion-screen-monitor
chmod +x scripts/install.sh
./scripts/install.sh
```

Le script installe les dépendances npm, configure un service systemd user pour le backend et ajoute le kiosk Chromium au démarrage GNOME.

## Développement

```bash
# Terminal 1 — backend (port 3001)
cd backend && npm install && npx ts-node src/server.ts

# Terminal 2 — frontend (port 5173)
cd frontend && npm install && npm run dev
```

Ouvrir : http://localhost:5173

## Affichage sur l'écran tactile intégré

Sur Wayland/GNOME, pour cibler spécifiquement l'écran tactile :

```bash
# Identifier l'écran tactile
gnome-randr  # ou xrandr si en mode Xwayland

# Lancer en kiosk sur l'écran secondaire
chromium-browser --kiosk --window-position=X,Y http://localhost:5173
```

## Métriques

| Widget | Source |
|--------|--------|
| CPU usage % | `/proc/stat` |
| CPU fréquence | `/sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq` |
| CPU temp | `/sys/class/hwmon/hwmon*/name=k10temp` |
| GPU busy % (iGPU) | `/sys/class/drm/card0/device/gpu_busy_percent` |
| GPU temp (iGPU) | `/sys/class/hwmon/hwmon*/name=amdgpu` |
| eGPU NVIDIA (4070) | `nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total,temperature.gpu,power.draw` |
| RAM | `/proc/meminfo` |
| Réseau | `/proc/net/dev` |
| Disque | `df -k /` |
| Ventilateurs | `/sys/class/hwmon/hwmon*/fan*_input` |

## Profils d'alimentation

Utilise `powerprofilesctl` (GNOME power-profiles-daemon, aucun sudo requis) :
- **Éco** → `power-saver`
- **Équilibré** → `balanced`
- **Performance** → `performance`