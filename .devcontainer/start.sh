#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/../Proyecto_Planta_Emergencia_Codex"
mkdir -p .runtime
# flock is released automatically when the supervisor exits.
nohup flock -n .runtime/codespaces.lock node scripts/codespaces.mjs >> .runtime/codespaces.log 2>&1 < /dev/null &
