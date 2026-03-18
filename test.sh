#!/bin/bash
# =============================================================================
# Playwright Tests für Praxis Wabner
#
# Verwendung:
#   bash test.sh              # Alle Tests, alle Geräte
#   bash test.sh --mobile     # Nur mobile Geräte
#   bash test.sh --desktop    # Nur Desktop
#   bash test.sh --quick      # Schnelltest (1 Gerät pro Kategorie)
#   bash test.sh --grep "Navigation"  # Nur Navigation-Tests
#
# Voraussetzung: Server muss laufen (mvn tomcat7:run)
# =============================================================================

set -e

# Host-IP ermitteln (für Docker-Zugriff auf localhost)
HOST_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo "host.docker.internal")
BASE_URL="http://${HOST_IP}:8080/praxis-wabner"

echo "═══════════════════════════════════════════════════════════════"
echo "  Playwright Tests - Praxis Wabner"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  BASE_URL: $BASE_URL"
echo "  Server:   mvn tomcat7:run (muss laufen!)"
echo ""

# Argumente verarbeiten
PROJECTS=""
EXTRA_ARGS=""

for arg in "$@"; do
  case $arg in
    --mobile)
      PROJECTS="--project=iPhone\ SE --project=iPhone\ 14 --project=Pixel\ 7"
      ;;
    --tablet)
      PROJECTS="--project=iPad\ Mini --project=iPad\ Pro\ 11 --project=Galaxy\ Tab\ S4"
      ;;
    --desktop)
      PROJECTS="--project=Desktop\ 1024 --project=Desktop\ 1440 --project=Desktop\ 1920"
      ;;
    --quick)
      # Schnelltest: nur 1 Gerät pro Kategorie
      PROJECTS="--project=iPhone\ 14 --project=iPad\ Mini --project=Desktop\ 1024"
      ;;
    *)
      EXTRA_ARGS="$EXTRA_ARGS $arg"
      ;;
  esac
done

# Docker-Image prüfen (falls nicht vorhanden, bauen)
if ! docker image inspect praxis-tests >/dev/null 2>&1; then
  echo "  Docker-Image nicht gefunden, baue es..."
  docker build -t praxis-tests tests/
  echo ""
fi

# Tests ausführen (vorgebautes Image = kein npm install nötig)
docker run --rm \
  -v "$(pwd)/tests:/work/tests:ro" \
  -e BASE_URL="$BASE_URL" \
  praxis-tests \
  bash -c "npx playwright test --config=tests/playwright.config.js --reporter=list $PROJECTS $EXTRA_ARGS"
