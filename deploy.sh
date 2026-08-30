#!/bin/bash
set -euo pipefail
cd /var/www/dur-store
BRANCH=master
git fetch origin "$BRANCH"
rm -f .git/index.lock
git reset --hard "origin/$BRANCH"
npm ci || npm install
npm run build
pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs
pm2 save
echo "dur-store deploy ok $(date -u +%Y-%m-%dT%H:%M:%SZ)"
