#!/usr/bin/env bash
set -euo pipefail

HOST=${1:-localhost}
PORT=${2:-5433}
RETRIES=${3:-30}

echo "Waiting for DB ${HOST}:${PORT}..."
for i in $(seq 1 $RETRIES); do
  if nc -z $HOST $PORT; then
    echo "DB is up"
    exit 0
  fi
  sleep 1
done

echo "Timed out waiting for DB" >&2
exit 1
