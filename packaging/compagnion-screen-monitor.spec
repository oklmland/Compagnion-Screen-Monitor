Name:           compagnion-screen-monitor
Version:        1.0.0
Release:        1%{?dist}
Summary:        Dashboard tactile de monitoring système pour mini PC (Aoostar / Fedora / GNOME)

License:        MIT
URL:            https://github.com/oklmland/Compagnion-Screen-Monitor
Source0:        %{name}-%{version}.tar.gz

BuildArch:      noarch
BuildRequires:  nodejs >= 18
BuildRequires:  npm

Requires:       nodejs >= 18
# Outils optionnels : sans eux, les fonctions concernées sont juste masquées.
Recommends:     power-profiles-daemon
Recommends:     brightnessctl
Recommends:     pipewire-utils
Recommends:     chromium
Recommends:     pciutils

%description
Compagnion Screen Monitor affiche en temps réel CPU, GPU (iGPU AMD + eGPU
NVIDIA Oculink), RAM, SSD, réseau, ventilateurs, météo et profil d'alimentation
sur le petit écran tactile intégré d'un mini PC. Inspiré de l'interface
Minisforum AtomMan X7 Ti, pensé pour l'Aoostar G Flip 8845HS sous Fedora/GNOME.

Backend Node.js + frontend React servis sur http://localhost:3001 (localhost
uniquement). Démarrage via service utilisateur systemd, affichage en kiosk
Chromium au login.

%prep
%autosetup -n %{name}-%{version}

%build
pushd backend
npm ci
npm run build
popd
pushd frontend
npm ci
npm run build
popd

%install
# On ne garde que les dépendances de production du backend
pushd backend
npm prune --omit=dev
popd

install -d %{buildroot}/opt/%{name}/backend
cp -r backend/dist backend/node_modules backend/package.json \
      %{buildroot}/opt/%{name}/backend/

install -d %{buildroot}/opt/%{name}/frontend
cp -r frontend/dist %{buildroot}/opt/%{name}/frontend/

# Unit utilisateur système-wide : chaque utilisateur l'active avec
#   systemctl --user enable --now compagnion-monitor
install -Dm644 packaging/compagnion-monitor.service \
      %{buildroot}%{_userunitdir}/compagnion-monitor.service

# Autostart global du kiosk Chromium (s'applique à toutes les sessions GNOME)
install -Dm644 packaging/compagnion-kiosk.desktop \
      %{buildroot}%{_sysconfdir}/xdg/autostart/compagnion-kiosk.desktop

%files
/opt/%{name}
%{_userunitdir}/compagnion-monitor.service
%{_sysconfdir}/xdg/autostart/compagnion-kiosk.desktop

%post
cat <<'EOF'

Compagnion Screen Monitor installé.

  Activer le backend pour votre session :
    systemctl --user enable --now compagnion-monitor

  Le dashboard sera servi sur http://localhost:3001
  Le kiosk Chromium se lancera automatiquement à la prochaine connexion.

EOF

%changelog
* Thu Jun 26 2026 oklmland - 1.0.0-1
- Première version packagée RPM
