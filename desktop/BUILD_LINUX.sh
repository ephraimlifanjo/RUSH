#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
python3 -m venv .venv
.venv/bin/python -m pip install -U pip
.venv/bin/python -m pip install -r python/requirements.txt
npm install
npm run check
.venv/bin/python python/self_test.py
bash scripts/build-native.sh || true
bash scripts/build-python.sh
npm run build:ui
npm run dist:linux
printf 'Build complete: %s/release\n' "$PWD"
