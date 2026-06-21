#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"

echo "==> Installation des dépendances backend..."
cd "$ROOT/backend" && npm install

echo "==> Installation des dépendances frontend..."
cd "$ROOT/frontend" && npm install

echo "==> Configuration du service systemd..."
SERVICE_SRC="$SCRIPT_DIR/compagnion-monitor.service"
SERVICE_DEST="$HOME/.config/systemd/user/compagnion-monitor.service"
mkdir -p "$HOME/.config/systemd/user"
sed "s|__ROOT__|$ROOT|g" "$SERVICE_SRC" > "$SERVICE_DEST"
systemctl --user daemon-reload
systemctl --user enable compagnion-monitor.service
systemctl --user start compagnion-monitor.service
echo "==> Service backend démarré."

echo "==> Configuration de l'autostart GNOME (Chromium kiosk)..."
DESKTOP_DEST="$HOME/.config/autostart/compagnion-kiosk.desktop"
mkdir -p "$HOME/.config/autostart"
cp "$SCRIPT_DIR/compagnion-kiosk.desktop" "$DESKTOP_DEST"
echo "==> Autostart configuré."

echo ""
echo "Installation terminée !"
echo "  Backend : systemctl --user status compagnion-monitor"
echo "  Frontend : cd $ROOT/frontend && npm run dev"
echo "  Dashboard : http://localhost:5173"
