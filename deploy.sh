#!/bin/bash
set -euo pipefail
cd /var/www/dur-store
BRANCH=master
git fetch origin "$BRANCH"
rm -f .git/index.lock
git reset --hard "origin/$BRANCH"
# NOTE: there used to be a `cp /var/www/dur-overlays/dur-store-proxy.ts ./proxy.ts`
# here, overwriting the tracked proxy.ts with a passthrough stub on every deploy.
# It disabled clerkMiddleware() entirely (breaking server-side auth() on the admin
# routes) and was working around what turned out to be the `-H` mismatch now fixed
# in ecosystem.config.cjs. Do not reintroduce it.
npm ci || npm install
npm run build
pm2 reload ecosystem.config.cjs --update-env || pm2 start ecosystem.config.cjs
pm2 save
echo "dur-store deploy ok $(date -u +%Y-%m-%dT%H:%M:%SZ)"
