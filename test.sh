#!/bin/bash
# Responsive Design Tests - Docker only
set -e

HOST_IP=$(ipconfig getifaddr en0 2>/dev/null || hostname -I | awk '{print $1}')
BASE_URL="http://${HOST_IP}:8080/praxis-wabner"

echo "BASE_URL: $BASE_URL"
echo "Server must be running: mvn tomcat7:run"
echo ""

docker run --rm \
  -v "$(pwd)/tests:/work/tests:ro" \
  -w /work \
  -e BASE_URL="$BASE_URL" \
  mcr.microsoft.com/playwright:v1.58.0-noble \
  bash -c "npm init -y >/dev/null && npm i -s @playwright/test@1.58.0 >/dev/null 2>&1 && npx playwright test tests/ --reporter=list"
