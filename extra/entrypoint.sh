#!/bin/sh

if [ ! -f /app/data/config.yml ]; then
  echo "No config.yml found, copying example config..."
  mkdir -p /app/data
  cp /app/example/config.yml /app/data/config.yml
fi

exec node /app/server/index.mjs
