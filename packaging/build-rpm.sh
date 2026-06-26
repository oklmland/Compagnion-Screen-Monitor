#!/bin/bash
# Construit le RPM à partir de l'état git courant.
# Prérequis : sudo dnf install rpm-build nodejs npm pciutils
set -e

NAME=compagnion-screen-monitor
VERSION=1.0.0
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TOPDIR="${HOME}/rpmbuild"

echo "==> Préparation de l'arborescence rpmbuild dans $TOPDIR"
mkdir -p "$TOPDIR"/{BUILD,RPMS,SOURCES,SPECS,SRPMS}

echo "==> Création de la tarball source"
TMP="$(mktemp -d)"
git -C "$ROOT" archive --format=tar --prefix="${NAME}-${VERSION}/" HEAD \
  | tar -x -C "$TMP"
tar czf "$TOPDIR/SOURCES/${NAME}-${VERSION}.tar.gz" -C "$TMP" "${NAME}-${VERSION}"
rm -rf "$TMP"

cp "$ROOT/packaging/${NAME}.spec" "$TOPDIR/SPECS/"

echo "==> rpmbuild (npm a besoin du réseau pour télécharger les dépendances)"
rpmbuild -ba "$TOPDIR/SPECS/${NAME}.spec"

echo ""
echo "==> Terminé. RPM disponible dans :"
ls -1 "$TOPDIR"/RPMS/noarch/${NAME}-${VERSION}*.rpm
echo ""
echo "Installation :"
echo "  sudo dnf install $TOPDIR/RPMS/noarch/${NAME}-${VERSION}-1.*.noarch.rpm"
echo "  systemctl --user enable --now compagnion-monitor"
