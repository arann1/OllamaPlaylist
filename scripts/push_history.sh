#!/usr/bin/env bash
# Push updated history.json to GitHub (called after playlist runs).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="${1:-/dev/stdout}"

cd "$ROOT"

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
fi

if [[ -z "${GITHUB_TOKEN:-}" ]]; then
  echo "Skipping git push — set GITHUB_TOKEN in .env" | tee -a "$LOG_FILE"
  exit 0
fi

if ! command -v git >/dev/null; then
  echo "Skipping git push — git not installed" | tee -a "$LOG_FILE"
  exit 0
fi

git config user.email "${GIT_USER_EMAIL:-ollama-playlist@local.bot}"
git config user.name "${GIT_USER_NAME:-OllamaPlaylist Bot}"

REMOTE="https://x-access-token:${GITHUB_TOKEN}@github.com/a-r-a-n/OllamaPlaylist.git"

echo "Syncing with GitHub..." | tee -a "$LOG_FILE"
git fetch "$REMOTE" main 2>>"$LOG_FILE" || true

if [[ -f "$ROOT/package.json" ]] && command -v npm >/dev/null; then
  npm run build >>"$LOG_FILE" 2>&1 || true
fi

git add data/history.json
if git diff --cached --quiet; then
  echo "No history changes to push" | tee -a "$LOG_FILE"
  exit 0
fi

git commit -m "Auto-update playlist history ($(date +%Y-%m-%d\ %H:%M))" >>"$LOG_FILE" 2>&1

git pull "$REMOTE" main --rebase --autostash >>"$LOG_FILE" 2>&1 || {
  echo "Git pull failed — resolve on server manually" | tee -a "$LOG_FILE"
  exit 1
}

git push "$REMOTE" main >>"$LOG_FILE" 2>&1
echo "Pushed history to GitHub — dashboard will redeploy" | tee -a "$LOG_FILE"
