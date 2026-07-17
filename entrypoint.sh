#!/bin/sh

echo "Waiting for database..."

npx prisma migrate deploy

echo "Seeding database..."

npm run db:seed

echo "Starting application..."

exec "$@"