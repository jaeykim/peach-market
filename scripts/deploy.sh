#!/usr/bin/env bash
# Deploy script: SSH to remote server, pull, migrate, build, restart
# Usage: ./scripts/deploy.sh

set -e

SERVER="ubuntu@13.125.225.250"
KEY="$HOME/subl.pem"
REMOTE_PATH="/home/ubuntu/peach-market"

echo "📦 Pushing local changes..."
git push origin main

echo "🚀 Deploying to $SERVER..."
ssh -i "$KEY" "$SERVER" "
  set -e
  cd $REMOTE_PATH
  echo '⏸  Stopping service...'
  sudo systemctl stop peach-market
  echo '📥 Pulling latest...'
  git pull origin main
  echo '📦 Installing deps (if any)...'
  npm install --no-audit --no-fund 2>&1 | tail -3
  echo '🗄  Migrating database...'
  npx prisma migrate deploy 2>&1 | tail -3
  npx prisma generate 2>&1 | tail -2
  echo '🔨 Building...'
  npm run build 2>&1 | tail -5
  echo '▶️  Starting service...'
  sudo systemctl start peach-market
  sleep 4
  curl -sS -o /dev/null -w '✅ HTTP %{http_code}\n' http://localhost:3000/
"
echo "✅ Deploy complete: http://13.125.225.250:3000"
