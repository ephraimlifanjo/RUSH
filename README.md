# RUSH Office Suite

**PDF + Documents. Fast, private, professional.**

RUSH Office Suite is a desktop PDF and document workspace focused on professional files instead of becoming another oversized office package. It combines a familiar Acrobat-style PDF workflow with a Word-style document editor while keeping local documents on the user's device by default.

## Product scope

### PDF Studio

- PDF.js viewer with pages, zoom and local rendering.
- Search selectable text and OCR-search scanned/image-only PDF pages.
- Add/edit text regions, highlight, underline, strikeout, comments, whiteout and redaction workflow.
- Merge, split, extract, delete, rotate, reorder, duplicate, crop and insert blank pages.
- Forms, image signatures, certificate-based digital PDF signing engine, AES-256 protection/unlock, metadata, page numbers, watermark, compression, grayscale and image conversion.

### Document Editor

- Open/edit/save DOCX, ODT, RTF, TXT and HTML.
- Import legacy DOC through a compatible local converter when available; save the result as DOCX.
- Undo/redo, fonts, sizes, bold/italic/underline, alignment, lists, tables, images, links, emoji, spell checking, find/replace and PDF export.
- Professional starting templates for reports, invoices, CVs, letters, invitations, school reports, minutes and proposals.
- Device fonts plus secure local font import for TTF/OTF/WOFF/WOFF2.

### Local performance and privacy

- Electron renderer: sandboxed, context-isolated, no Node.js integration.
- Python/PDFium document engine isolated from the renderer.
- C++17 native discovery helper for large libraries, with fallback when unavailable.
- SQLite FTS local content index and optional DuckDB analytics.
- On-demand OCR to reduce unnecessary CPU/RAM work.
- Local version history and encrypted secure-package support.
- No dedicated RUSH cloud backend required for normal editing.

## Themes and languages

Interface themes: **RUSH, Leonore, Melody, Ephraim Royale, Minimal Notes and Midnight**.

Localization framework: **English, Spanish, German, Japanese, French, Portuguese, Russian, Italian, Chinese and Arabic**. Arabic uses RTL UI direction. Documents remain Unicode and use compatible fonts installed on the device.

Optional on-device translation is deliberately separate from the core install so the application stays lighter. DOCX/TXT/RTF/HTML translation is supported when local language packs are installed; exact-layout PDF translation is not advertised as complete.

## Free and Pro

The planned model has no required subscription:

- **RUSH Free — $0** for useful core PDF/document workflows.
- **RUSH Pro — $14.99 one-time planned direct price** for advanced OCR, redaction/editing, certificate signing, premium themes/templates, local version history, advanced/batch workflows and optional translation.

Regional store pricing may differ. Store listings shown on the website stay marked **Coming soon** until real listings exist.

## Repository

```text
RUSH/
├─ index.html                 # static Vercel marketing site
├─ docs.html                  # public documentation
├─ privacy.html               # public privacy/security page
├─ styles.css
├─ app.js
├─ vercel.json
├─ assets/
├─ docs/                      # developer/user/security/licensing docs
├─ desktop/
│  ├─ electron/               # secure desktop shell + IPC
│  ├─ renderer/               # React UI + themes/localization
│  ├─ python/                 # PDF/doc/OCR/signing/translation engines
│  ├─ native/                 # C++17 helper
│  ├─ resources/
│  └─ scripts/
└─ .github/workflows/         # validation + cross-platform packaging
```

## Run on Windows

```powershell
git clone https://github.com/ephraimlifanjo/RUSH.git
cd RUSH\desktop
powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows.ps1
npm run dev
```

Optional local translation runtime:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows.ps1 -WithTranslation
```

## Build installers

```powershell
cd desktop
npm run dist:win       # Windows NSIS EXE
npm run dist:msi       # Windows MSI
npm run dist:msix      # Windows MSIX target
npm run dist:portable  # Windows portable
```

```bash
npm run dist:linux     # Linux AppImage + DEB
npm run dist:mac       # macOS DMG + ZIP (build on macOS)
```

Packaged end users do not need Node.js, Python or CMake.

## Documentation

- [User Guide](docs/USER_GUIDE.md)
- [Developer Setup](docs/DEVELOPER_SETUP.md)
- [Build and Release](docs/BUILD_AND_RELEASE.md)
- [Security Architecture](docs/SECURITY.md)
- [Licensing and Monetization](docs/LICENSING.md)

## Commercial-release requirements

The repository intentionally does **not** contain private license-signing keys, commercial code-signing private keys, certificate passwords or store credentials. Before a commercial direct Pro release, replace the placeholder public license key with the real public key and keep the matching private key outside the repository. Production installers should be code-signed/notarized where appropriate.

## Brand

RUSH Office Suite is an original product created by **Nova Studio Plateformes**. Founder: **Ephraim Lifanjo**.

Adobe Acrobat and Microsoft Word are referenced only as workflow comparisons. RUSH is not affiliated with Adobe or Microsoft.
