# Build automatique via COPR

COPR (dépôt Fedora perso) construit le RPM à ta place et le **reconstruit
automatiquement à chaque `git push`**. Une fois en place, tu installes/mets à
jour avec un simple `dnf`.

## Pourquoi un réglage spécial réseau

Le build du RPM lance `npm ci`, qui télécharge les dépendances. Or les builds
COPR (mock) sont **sans réseau par défaut**. Il faut donc activer l'accès
réseau sur le projet COPR (option `--enable-net on`). C'est la seule
particularité ; tout le reste est standard.

---

## 1. Préparer copr-cli (une fois)

```bash
sudo dnf install copr-cli
# Récupère ton token sur https://copr.fedorainfracloud.org/api/
# puis colle-le dans ~/.config/copr
```

## 2. Créer le projet (réseau activé)

```bash
copr-cli create compagnion-screen-monitor \
  --chroot fedora-44-x86_64 \
  --enable-net on \
  --description "Dashboard tactile de monitoring système (Aoostar G Flip / Fedora)"
```

> `noarch` se construit très bien sur le chroot `x86_64`. Ajoute d'autres
> chroots avec des `--chroot` supplémentaires si besoin.

## 3. Ajouter le paquet (SCM + auto-rebuild)

COPR clonera le repo et lancera `.copr/Makefile` pour fabriquer le SRPM.

```bash
copr-cli add-package-scm compagnion-screen-monitor \
  --name compagnion-screen-monitor \
  --clone-url https://github.com/oklmland/Compagnion-Screen-Monitor.git \
  --commit main \
  --spec packaging/compagnion-screen-monitor.spec \
  --type git \
  --method make_srpm \
  --webhook-rebuild on
```

## 4. Premier build

```bash
copr-cli build-package compagnion-screen-monitor --name compagnion-screen-monitor
```

Suis la progression sur la page du projet COPR. À la fin, le RPM est publié
dans le dépôt.

## 5. Rebuild auto à chaque push (webhook GitHub)

1. Sur COPR : projet → **Settings → Integrations** → copie l'URL webhook GitHub
   (du type `https://copr.fedorainfracloud.org/webhooks/github/<id>/<token>/`).
2. Sur GitHub : repo → **Settings → Webhooks → Add webhook**
   - Payload URL : l'URL copiée
   - Content type : `application/json`
   - Events : *Just the push event*
3. Désormais chaque `git push` sur `main` relance le build automatiquement.

---

## Installer / mettre à jour (côté mini PC)

```bash
sudo dnf copr enable <ton-utilisateur-fedora>/compagnion-screen-monitor
sudo dnf install compagnion-screen-monitor
systemctl --user enable --now compagnion-monitor
```

Les mises à jour arrivent ensuite comme n'importe quel paquet : `sudo dnf upgrade`.

---

## Variante 100 % hors-ligne (sans `--enable-net`)

Si tu préfères ne pas activer le réseau dans COPR, il faut *vendorer* les
dépendances npm dans la tarball source (les embarquer pour que `npm ci
--offline` fonctionne). C'est plus lourd à maintenir. Dis-le si tu veux que je
mette en place cette variante (génération d'un `vendor.tar.gz` + ajustement du
spec).
