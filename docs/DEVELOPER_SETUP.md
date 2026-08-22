# Developer Setup

The desktop product lives in `desktop/` and combines Electron/React, a Python document/PDF worker and an optional C++17 native scanner.

## Architecture

- `desktop/electron/` — Electron main process, secure preload, local service bridges.
- `desktop/renderer/` — React UI bundled with esbuild plus local CSS/runtime enhancements.
- `desktop/python/` — PDF, OCR, document, signing, indexing and optional translation engines.
- `desktop/native/` — C++17 fast file discovery/index helper.
- `desktop/resources/` — packaged native/Python/OCR resources and public verification files.
- `desktop/scripts/` — setup, validation and packaging scripts.

The renderer is sandboxed and does not receive unrestricted Node.js/file-system access.

## Windows

Requirements for developers/build machines: Node.js 20+, npm, Python 3.10+, Git. CMake/C++ is optional; the app has a slower JavaScript discovery fallback when the native scanner is unavailable.

```powershell
cd desktop
powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows.ps1
npm run dev
```

Optional local translation runtime:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows.ps1 -WithTranslation
```

Translation model packs are intentionally not installed automatically. Install only the language pairs needed on the device.

## Linux/macOS

```bash
cd desktop
npm install
python3 -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
pip install -r python/requirements.txt
./scripts/build-native.sh || true
npm run build:ui
npm run dev
```

For optional translation:

```bash
pip install -r python/requirements-translation.txt
```

## OCR

Scanned-PDF OCR uses local Tesseract. The Python package `pytesseract` is an adapter; the Tesseract executable and desired language data must also exist on the device/build image. Selectable-text PDF search does not require Tesseract.

## Environment variables

A `.env` is **not required** for ordinary local development or normal unsigned installer builds. Supported developer-only variables include:

- `RUSH_PYTHON_EXE` — override Python executable in development.
- `RUSH_LICENSE_PUBLIC_KEY_PEM` — test public-key override for direct license verification.
- Signing/notarization variables used by electron-builder/CI should live in secret storage, not the repository.

Never put a direct-license private signing key in `.env` committed to GitHub or inside the desktop binary.

## Development Pro testing

Production direct Pro activation requires a signed license. For development, generate a temporary local key pair and development license outside the repository. Do not add a hard-coded production bypass to the packaged app.
