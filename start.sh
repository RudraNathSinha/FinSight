#!/usr/bin/env bash
cd "$(dirname "$0")"
export FINSIGHT_ROOT="$(pwd)"
PORT="${PORT:-8000}"
echo "FinSightApplication (unified) on http://127.0.0.1:${PORT}/"
cd part2_global_equity
exec python -m uvicorn backend.main:app --host 0.0.0.0 --port "$PORT"
