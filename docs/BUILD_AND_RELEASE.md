# Build and Release

## Validate first

From `desktop/`:

```powershell
npm run check
npm run build:ui
npm run selftest
```

Do not run a packaging command while a development Electron process is still holding `release/` files open on Windows.

## Windows

```powershell
npm run dist:win       # NSIS installer EXE
npm run dist:msi       # MSI for managed deployment
npm run dist:msix      # MSIX package target
npm run dist:portable  # portable EXE
```

Outputs are written under `desktop/release/`.

NSIS is the normal guided installer for individuals. MSI is intended for schools, offices and administrators who deploy through enterprise tooling. MSIX is prepared for Store/package workflows but Store identity/publisher values must come from the real Partner Center listing.

## Linux

```bash
npm run build:ui
./scripts/build-python.sh
./scripts/build-native.sh || true
npm run dist:linux
```

Targets: AppImage and DEB. Flatpak/Flathub publication is a separate packaging/publication task and should not be advertised as live until accepted.

## macOS

Build on macOS:

```bash
npm run build:ui
./scripts/build-python.sh
./scripts/build-native.sh || true
npm run dist:mac
```

Targets: DMG and ZIP. A public macOS release should use a valid Apple Developer ID and notarization where required.

## Engine packaging

The end-user desktop package embeds `rush-office-engine` built by PyInstaller and, when available, `rush-native-core` built from C++17 sources. The client therefore does not need a Python/C++ development environment.

## Code signing

Production signing credentials belong in CI/release secret storage. Do not commit certificates, private keys or passwords. Windows Authenticode and Apple signing/notarization should be enabled for public commercial releases.

## Integrity manifest

Run the release integrity generator after engine/native resources are built and before the final package. The app can then compare packaged resource SHA-256 hashes with the generated manifest at runtime.

## Store distribution

The public website only marks Microsoft Store, Flathub and Uptodown as available after an official listing exists. Until then, direct GitHub Releases are the canonical download location.

## Release checklist

1. Run validation and engine self-tests.
2. Build native/Python engines for the target OS/architecture.
3. Generate integrity manifest.
4. Build installer/package.
5. Code-sign/notarize release artifacts.
6. Install on a clean test machine and test open/save/file associations.
7. Test large PDF and document samples, OCR optional path, Free/Pro gating and uninstall.
8. Publish checksums and release notes.
9. Update website store buttons only after real store listings are public.
