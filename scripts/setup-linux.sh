#!/usr/bin/env bash
# One-time Linux server setup: venv, deps, cron job.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENV="$ROOT/.venv"
BACKEND="$ROOT/backend"
CRON_MARKER="# ollama-playlist-auto"

echo "Setting up OllamaPlaylist at $ROOT"

if ! command -v python3 >/dev/null; then
  echo "python3 not found. Install it first (e.g. sudo apt install python3 python3-venv python3-pip)"
  exit 1
fi

if ! command -v ollama >/dev/null; then
  echo "Warning: ollama not in PATH — ensure the Ollama service is running"
fi

if [[ ! -f "$ROOT/.env" ]]; then
  echo "Missing $ROOT/.env — copy your Spotify/Ollama credentials there first"
  exit 1
fi

if [[ ! -f "$BACKEND/.spotify_cache" ]]; then
  echo "Warning: no Spotify token cache at backend/.spotify_cache"
  echo "Run playlist_updater.py once interactively before enabling cron"
fi

echo "Creating virtualenv..."
rm -rf "$VENV"
python3 -m venv "$VENV"
"$VENV/bin/pip" install --upgrade pip
"$VENV/bin/pip" install -r "$ROOT/backend/requirements.txt"

chmod +x "$ROOT/scripts/run_playlist_update.sh"

RUN_LINE="0 0 * * * $ROOT/scripts/run_playlist_update.sh"
TMP_CRON="$(mktemp)"
crontab -l 2>/dev/null | grep -v "$CRON_MARKER" | grep -v "run_playlist_update.sh" > "$TMP_CRON" || true
{
  cat "$TMP_CRON"
  echo "$CRON_MARKER"
  echo "$RUN_LINE"
} | crontab -
rm -f "$TMP_CRON"

echo ""
echo "Done."
echo "  Virtualenv: $VENV"
echo "  Cron: daily at midnight (0 0 * * *)"
echo "  Logs:     $ROOT/logs/cron_*.log"
echo ""
echo "Test now:"
echo "  $ROOT/scripts/run_playlist_update.sh"
echo ""
crontab -l | tail -5
