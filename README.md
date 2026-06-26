# Compagnion Screen Monitor

Dashboard de monitoring système tactile pour **Aoostar G Flip 8845HS** — Fedora 44 / GNOME / Wayland.

Inspiré de l'interface tactile Minisforum AtomMan X7 Ti.

## Aperçu

- **Section haute** : horloge (3 styles), date, météo réelle, sélection du profil d'alimentation
- **Section milieu** : grille configurable — CPU, GPU, RAM, SSD en temps réel (noms matériel détectés automatiquement)
- **Section basse** : débit réseau, RPM ventilateur, contrôles luminosité/volume

## Détection automatique du matériel

Les noms du CPU, du GPU et du SSD sont lus directement depuis le système
(`/proc/cpuinfo`, `lspci`, `lsblk`) — rien n'est codé en dur, l'outil
fonctionne donc sur n'importe quelle config sans modification.

## Météo

La météo (icône + plage min~max du jour) provient de l'API gratuite
[Open-Meteo](https://open-meteo.com) (sans clé), avec géolocalisation
automatique par IP. Rafraîchie toutes les 15 min. Si le réseau est
indisponible, la zone météo est simplement masquée.

## Sécurité / réseau

Le serveur écoute uniquement sur `127.0.0.1` (accès local), car il expose
des contrôles système (profil d'alim, luminosité, volume). Pour y accéder
depuis un autre appareil volontairement : `HOST=0.0.0.0 npm start`.

## Performance

Les valeurs qui changent lentement (profil d'alim, luminosité, volume,
disque) sont interrogées en arrière-plan toutes les 2 s, et la météo toutes
les 15 min — la boucle WebSocket à 500 ms ne lit que des fichiers `/proc` et
`/sys` (instantané), sans jamais lancer de sous-processus bloquant.

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

## Installation via RPM (Fedora)

Le plus propre : install/désinstall gérés par `dnf`.

```bash
# Construire le paquet depuis les sources
sudo dnf install rpm-build nodejs npm pciutils
./packaging/build-rpm.sh

# Installer le RPM généré
sudo dnf install ~/rpmbuild/RPMS/noarch/compagnion-screen-monitor-1.0.0-1.*.noarch.rpm

# Activer le backend pour ta session (kiosk auto au prochain login)
systemctl --user enable --now compagnion-monitor
```

Le RPM installe l'appli dans `/opt/compagnion-screen-monitor`, un service
utilisateur systemd (`/usr/lib/systemd/user/`) et l'autostart du kiosk
(`/etc/xdg/autostart/`). Désinstallation : `sudo dnf remove compagnion-screen-monitor`.

> La construction télécharge les dépendances npm (réseau requis au moment du
> build). `nodejs` est la seule dépendance runtime obligatoire ; les outils de
> contrôle (`brightnessctl`, `power-profiles-daemon`, `wpctl`, `chromium`) sont
> recommandés et installés automatiquement par `dnf` si disponibles.

### Build & mise à jour automatiques via COPR

Pour que le RPM se construise tout seul à chaque `git push` et s'installe via
`dnf copr enable`, voir **[packaging/COPR.md](packaging/COPR.md)**.

## Installation rapide (script)

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
| Nom CPU | `/proc/cpuinfo` (model name) |
| Nom GPU | `lspci` (VGA/Display controller) |
| Nom SSD | `lsblk -ndo MODEL` du disque racine |
| Météo | Open-Meteo + géoloc IP (ipapi.co) |
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