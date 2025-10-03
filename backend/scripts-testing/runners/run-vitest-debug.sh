#!/usr/bin/env bash
set -uo pipefail
BASEDIR="$(pwd)"
files=( $(find "$BASEDIR/tests" -type f -name '*.test.*' | sort) )
echo "Found ${#files[@]} test files"
for i in "${!files[@]}"; do
  f="${files[$i]}"
  echo "---- RUN $((i+1))/${#files[@]} $f ----"
  BIN="$BASEDIR/node_modules/.bin/vitest"
  if [ ! -x "$BIN" ]; then
    echo "Local vitest binary not found at $BIN - falling back to npx"
    CMD=(npx vitest)
  else
    CMD=("$BIN")
  fi
  NODE_OPTIONS="--require $BASEDIR/tests/trace-requires.js" "${CMD[@]}" run "$f" --run --no-file-parallelism --maxWorkers=1 --reporter verbose 2>&1 | tee /tmp/vitest_run.log || true
  rc=$?
  if grep -q "Do not import \`@jest/globals\`" /tmp/vitest_run.log || grep -q "@@@ @jest/globals imported" /tmp/vitest_run.log; then
    echo "FOUND_IN=$f"
    sed -n '1,400p' /tmp/vitest_run.log
    exit 0
  fi
  echo "(vitest exit code: $rc)"
  echo "---- OK $f (no jest import) ----"
  if [ $(( (i+1) % 5 )) -eq 0 ]; then
    echo "--- checkpoint after $((i+1)) files ---"
  fi
  sleep 0.1
done
