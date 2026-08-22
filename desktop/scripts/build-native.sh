#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p resources/native
if ! command -v cmake >/dev/null 2>&1; then echo 'CMake not found; native helper is optional.'; exit 0; fi
cmake -S native -B native/build -DCMAKE_BUILD_TYPE=Release
cmake --build native/build --config Release
if [ -f native/build/rush-native-core ]; then cp native/build/rush-native-core resources/native/rush-native-core; chmod +x resources/native/rush-native-core; fi
printf 'RUSH native helper packaged when available.\n'
