#!/usr/bin/env bash
# Run the playlist updater (safe for cron / headless servers).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND="$ROOT/backend"
VENV="$ROOT/.venv"
LOG_DIR="$ROOT/logs"
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
  echo "Missing virtualenv at $VENV — run scripts/setup-linux.sh first" | tee -a "$LOG_FILE"
  exit 1
fi

echo "=== OllamaPlaylist cron run $(date -Is) ===" | tee -a "$LOG_FILE"
"$VENV/bin/python" playlist_updater.py >> "$LOG_FILE" 2>&1
echo "=== Finished $(date -Is) ===" | tee -a "$LOG_FILE"

# Keep last 14 days of cron logs
find "$LOG_DIR" -name 'cron_*.log' -mtime +14 -delete 2>/dev/null || true
