# RUSH Office Suite

**PDF + Documents. Private by default.**

RUSH Office Suite is the desktop PDF and document workspace by **Nova Studio Plateformes**. It combines an Acrobat-style PDF workspace with a Word-style document editor while keeping files local by default.

## Product scope

- PDF Studio: view, search, OCR search, annotate, organize, merge/split, protect, compress, convert, fill and sign.
- Document Editor: DOCX, ODT, RTF and TXT editing, templates, tables/images, headers/footers, page layout and PDF export.
- Legacy `.doc`: local conversion when Microsoft Word or LibreOffice is available.
- Local library: SQLite FTS indexing with optional DuckDB analytics.
- Native helper: C++17 filesystem discovery/indexing for large document libraries.
- Desktop: Electron + React shell with isolated Python document engine.
- Privacy-first: no dedicated RUSH cloud backend is required to edit local files.

## Repository

```text
RUSH/
├─ index.html            # Vercel marketing site
├─ styles.css
├─ app.js
├─ vercel.json
├─ desktop/              # Electron desktop product
│  ├─ electron/
│  ├─ renderer/
│  ├─ python/
│  ├─ native/
│  └─ scripts/
└─ .github/workflows/    # CI + cross-platform packaging
```

## Run on Windows

```powershell
git clone https://github.com/ephraimlifanjo/RUSH.git
cd RUSH\desktop
powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows.ps1
npm run dev
```

Build Windows installer:

```powershell
npm run dist:win
npm run dist:msi
```

Linux and macOS build scripts live in `desktop/BUILD_LINUX.sh` and `desktop/BUILD_MACOS.sh`.

## Brand

RUSH Office Suite is created by **Nova Studio Plateformes**.

Founder: **Ephraim Lifanjo**.

RUSH is an original product. Adobe Acrobat and Microsoft Word are referenced only as workflow comparisons; RUSH is not affiliated with Adobe or Microsoft.
