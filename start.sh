#!/bin/bash
# Jerusalem Quest - Single script to build & run everything
# Usage: ./start.sh

set -e
cd "$(dirname "$0")"

echo "=== Jerusalem Quest ==="

# 1. Install dependencies
echo "[1/5] Installing server dependencies..."
cd server && npm install --silent && cd ..

echo "[2/5] Installing client dependencies..."
cd client && npm install --silent && cd ..

# 2. Build client
echo "[3/5] Building client..."
cd client && npm run build && cd ..

# 3. DB setup (skip if already done)
echo "[4/5] Running database migrations & seed..."
cd server
npx drizzle-kit migrate 2>/dev/null || echo "  Migration failed - is Docker running?"
npx tsx src/scripts/seed.ts 2>/dev/null || echo "  Seed skipped (already seeded or DB not ready)"
cd ..

# 4. Start server (serves both API + built client)
echo "[5/5] Starting server on port ${PORT:-3001}..."
echo ""
echo "  Open http://localhost:${PORT:-3001}"
echo ""
cd server && npx tsx src/index.ts
