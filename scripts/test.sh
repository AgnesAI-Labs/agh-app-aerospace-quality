#!/bin/sh
# Run the vitest suite with the open-source checkout's vitest (AGNES_HARNESS, default ~/agnes-harness).
#   sh scripts/test.sh                      # all tests
#   sh scripts/test.sh test/domain.test.ts  # one file
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HARNESS="${AGNES_HARNESS:-$HOME/agnes-harness}"
VITEST="$HARNESS/node_modules/.bin/vitest"
[ -x "$VITEST" ] || { echo "vitest not found at $VITEST; run pnpm install in $HARNESS or set AGNES_HARNESS" >&2; exit 1; }
exec "$VITEST" run --root "$ROOT" --maxWorkers=1 "$@"
