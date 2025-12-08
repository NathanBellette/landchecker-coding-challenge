#!/usr/bin/env bash
set -e

# Wait for Postgres to be ready
until pg_isready -h "${POSTGRES_HOST:-db}" -U "${POSTGRES_USER:-postgres}" -d "${POSTGRES_DB:-myapp_development}" >/dev/null 2>&1; do
  sleep 1
done

# Install gems if not already installed
bundle check || bundle install

# Create and migrate DB (development only)
if [ "$RAILS_ENV" = "development" ] || [ -z "$RAILS_ENV" ]; then
  bundle exec rails db:create db:migrate 2>/dev/null || true
fi

# Remove any stale PID files
rm -f /app/tmp/pids/server.pid

# Start Rails server
bundle exec rails server -b 0.0.0.0 -p 3000