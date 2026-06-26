#!/usr/bin/env bash
# Run the playlist updater (safe for cron / headless servers).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/backend"
VENV="$ROOT/.venv"
LOG_DIR="$ROOT/logs"
LIVE_LOG="$LOG_DIR/live.log"
STAMP="$(date +%Y%m%d_%H%M%S)"
LOG_FILE="$LOG_DIR/cron_${STAMP}.log"

mkdir -p "$LOG_DIR"
cd "$BACKEND"

export SPOTIFY_HEADLESS=1
export OLLAMA_HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
export SPOTIFY_CACHE_PATH="$BACKEND/.spotify_cache"

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

if [[ ! -x "$VENV/bin/python" ]]; then
  echo "Missing virtualenv at $VENV — run scripts/setup-linux.sh first" | tee -a "$LOG_FILE" | tee -a "$LIVE_LOG"
  exit 1
fi

{
  echo ""
  echo "=== OllamaPlaylist cron run $(date -Is) ==="
  "$VENV/bin/python" -u playlist_updater.py
  echo "=== Finished $(date -Is) ==="
} 2>&1 | tee -a "$LOG_FILE" | tee -a "$LIVE_LOG"

"$ROOT/scripts/push_history.sh" "$LOG_FILE" 2>&1 | tee -a "$LIVE_LOG"

find "$LOG_DIR" -name 'cron_*.log' -mtime +14 -delete 2>/dev/null || true
