#!/bin/sh
set -e

if [ -z "$POSTGRES_PRISMA_URL" ]; then
  echo "❌ Environment variable POSTGRES_PRISMA_URL is not set. Exiting."
  exit 1
fi

echo "✅ POSTGRES_PRISMA_URL is set."

echo "🚀 Running Prisma migrations..."
pnpm prisma migrate deploy

echo "✅ Starting the bot..."
exec "$@"
