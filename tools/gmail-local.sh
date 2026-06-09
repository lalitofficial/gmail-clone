#!/usr/bin/env bash
# Local-testing helper: serve the Gmail clone at https://mail.google.com on THIS machine.
#
# This only edits *your own* /etc/hosts and installs a *local* CA (mkcert) so your
# browser trusts a cert you generated. It is for testing your clone on your machine —
# nothing leaves it. Disable with `disable` to restore access to the real Gmail.
#
# Usage:
#   bash tools/gmail-local.sh setup     # install mkcert + generate a trusted cert
#   sudo bash tools/gmail-local.sh enable    # point mail.google.com -> 127.0.0.1
#   sudo bash tools/gmail-local.sh disable   # restore real Gmail
#   bash tools/gmail-local.sh status
#
# Then run the dev server on port 443:   sudo npm run gmail -w apps/web
set -euo pipefail

HOSTS=/etc/hosts
MARKER="# gmail-clone-local"
HOST="mail.google.com"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERT_DIR="$SCRIPT_DIR/../apps/web/certs"

flush_dns() {
  dscacheutil -flushcache 2>/dev/null || true
  killall -HUP mDNSResponder 2>/dev/null || true
}

case "${1:-}" in
  setup)
    if ! command -v mkcert >/dev/null 2>&1; then
      echo "Installing mkcert via Homebrew…"
      brew install mkcert nss
    fi
    mkcert -install
    mkdir -p "$CERT_DIR"
    ( cd "$CERT_DIR" && mkcert "$HOST" )
    echo "✓ Cert generated in apps/web/certs/. Next: sudo bash tools/gmail-local.sh enable"
    ;;

  enable)
    if grep -q "$MARKER" "$HOSTS"; then
      echo "Already enabled."
    else
      printf '\n127.0.0.1 %s %s\n' "$HOST" "$MARKER" >> "$HOSTS"
      flush_dns
      echo "✓ $HOST now points to 127.0.0.1. Real Gmail is unreachable until you 'disable'."
      echo "  Start the server:  sudo npm run gmail -w apps/web    then open https://$HOST"
    fi
    ;;

  disable)
    # Remove the marked line; restores the real Gmail.
    sed -i '' "/$MARKER/d" "$HOSTS"
    flush_dns
    echo "✓ Removed. Real Gmail restored."
    ;;

  status)
    if grep -q "$MARKER" "$HOSTS"; then
      echo "ENABLED — $HOST -> 127.0.0.1 (real Gmail is blocked)"
    else
      echo "disabled — using the real $HOST"
    fi
    ;;

  *)
    echo "Usage: $0 {setup|enable|disable|status}   (enable/disable need sudo)"
    exit 1
    ;;
esac
