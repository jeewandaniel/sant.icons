#!/usr/bin/env bash
# Publish @santicons/mcp and @santicons/cli to npm.
#
# Prerequisites:
#   1. `npm login` once on this machine (publishes under @santicons scope).
#   2. The full manifest must already exist at apps/web/public/icons.json.
#      If you haven't run ingestion this session, run:
#          pnpm --filter @sant/ingestion run build
#          node packages/ingestion/dist/index.js
#
# Usage:
#   ./scripts/release.sh             # publishes both at their current versions
#   ./scripts/release.sh patch       # bumps both packages, then publishes
#   ./scripts/release.sh minor
#   ./scripts/release.sh major

set -euo pipefail

cd "$(dirname "$0")/.."

# --- Sanity checks -----------------------------------------------------------
if ! command -v pnpm >/dev/null 2>&1; then
  echo "✗ pnpm not found"; exit 1
fi
if ! npm whoami >/dev/null 2>&1; then
  echo "✗ Not logged in to npm. Run 'npm login' first."; exit 1
fi
if [ ! -f "apps/web/public/icons.json" ]; then
  echo "✗ Manifest missing. Run 'pnpm --filter @sant/ingestion run build && node packages/ingestion/dist/index.js' first."
  exit 1
fi

BUMP="${1:-}"

# --- Version bump (optional) -------------------------------------------------
if [ -n "$BUMP" ]; then
  if [[ "$BUMP" != "patch" && "$BUMP" != "minor" && "$BUMP" != "major" ]]; then
    echo "✗ Bump must be one of: patch | minor | major"; exit 1
  fi
  echo "→ Bumping $BUMP for both packages"
  pnpm --filter @santicons/mcp version "$BUMP" --no-git-tag-version
  pnpm --filter @santicons/cli version "$BUMP" --no-git-tag-version
fi

# --- Build (refreshes bundled manifests as a side effect) --------------------
echo "→ Building MCP server"
pnpm --filter @santicons/mcp run build

echo "→ Building CLI"
pnpm --filter @santicons/cli run build

# --- Publish -----------------------------------------------------------------
MCP_VERSION=$(node -p "require('./packages/mcp/package.json').version")
CLI_VERSION=$(node -p "require('./packages/cli/package.json').version")

echo
echo "About to publish:"
echo "  @santicons/mcp@$MCP_VERSION"
echo "  @santicons/cli@$CLI_VERSION"
read -r -p "Continue? [y/N] " confirm
case "$confirm" in
  [yY]|[yY][eE][sS]) ;;
  *) echo "Aborted."; exit 0 ;;
esac

echo "→ Publishing @santicons/mcp"
( cd packages/mcp && npm publish --access public )

echo "→ Publishing @santicons/cli"
( cd packages/cli && npm publish --access public )

echo
echo "✓ Published @santicons/mcp@$MCP_VERSION and @santicons/cli@$CLI_VERSION"
echo "  https://www.npmjs.com/package/@santicons/mcp"
echo "  https://www.npmjs.com/package/@santicons/cli"
