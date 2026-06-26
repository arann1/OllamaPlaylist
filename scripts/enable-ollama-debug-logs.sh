#!/bin/bash
# Enable verbose Ollama logs in journalctl on the iMac.
# Run on the machine where `systemctl status ollama` works.
#
# Usage:
#   chmod +x scripts/enable-ollama-debug-logs.sh
#   ./scripts/enable-ollama-debug-logs.sh

set -euo pipefail

OVERRIDE_DIR="/etc/systemd/system/ollama.service.d"
OVERRIDE_FILE="${OVERRIDE_DIR}/debug-logging.conf"

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  echo "Re-running with sudo..."
  exec sudo "$0" "$@"
fi

mkdir -p "$OVERRIDE_DIR"

cat > "$OVERRIDE_FILE" <<'EOF'
[Service]
Environment="OLLAMA_DEBUG=1"
Environment="OLLAMA_HOST=0.0.0.0:11434"
EOF

systemctl daemon-reload
systemctl restart ollama

echo "Ollama debug logging enabled."
echo "Watch logs with: journalctl -u ollama -f"
echo "You should now see load/eval timing and token counts per request."
