#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p resources/python
rm -f resources/python/rush-office-engine*
.venv/bin/python -m PyInstaller --noconfirm --clean --onefile --name rush-office-engine --distpath resources/python --workpath "${TMPDIR:-/tmp}/rush-pyinstaller" --specpath "${TMPDIR:-/tmp}/rush-pyinstaller-spec" python/engine_v2.py
printf 'RUSH Python engine packaged.\n'
