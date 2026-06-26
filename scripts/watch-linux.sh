#!/usr/bin/env bash
# Watch live logs from your Linux OllamaPlaylist server on your Mac.
# Usage: ./scripts/watch-linux.sh
# Optional: LINUX_HOST=aran@192.168.1.77 ./scripts/watch-linux.sh
set -euo pipefail

HOST="${LINUX_HOST:-aran@192.168.1.77}"
PROJECT="${LINUX_PROJECT:-/home/aran/Desktop/Storage/OllamaPlaylist}"

echo "Connecting to $HOST ..."
echo "Streaming $PROJECT/logs/live.log (Ctrl+C to stop)"
echo ""

if command -v sshpass >/dev/null && [[ -n "${SSHPASS:-}" ]]; then
  sshpass -e ssh -t "$HOST" "tail -n 40 -F '$PROJECT/logs/live.log' 2>/dev/null || tail -n 40 -F '$PROJECT'/logs/cron_*.log '$PROJECT'/logs/run_*.log"
else
  ssh -t "$HOST" "tail -n 40 -F '$PROJECT/logs/live.log' 2>/dev/null || tail -n 40 -F '$PROJECT'/logs/cron_*.log '$PROJECT'/logs/run_*.log"
fi
