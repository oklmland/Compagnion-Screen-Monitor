NAME = compagnion-screen-monitor
VERSION = 1.0.0

# Cible appelee par COPR (methode "Make SRPM") :
#   make -f .copr/Makefile srpm outdir=<dir>
# Genere la tarball depuis git puis construit le SRPM (sans reseau ici ;
# le telechargement npm a lieu plus tard, pendant le build RPM dans mock).
srpm:
	dnf -y install rpm-build git || true
	mkdir -p $(outdir)
	tmp=$$(mktemp -d); \
	mkdir -p $$tmp/SOURCES $$tmp/SPECS; \
	git archive --format=tar --prefix=$(NAME)-$(VERSION)/ HEAD | gzip > $$tmp/SOURCES/$(NAME)-$(VERSION).tar.gz; \
	cp packaging/$(NAME).spec $$tmp/SPECS/; \
	rpmbuild -bs $$tmp/SPECS/$(NAME).spec --define "_topdir $$tmp" --define "_srcrpmdir $(outdir)"; \
	rm -rf $$tmp
