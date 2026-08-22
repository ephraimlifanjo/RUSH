# RUSH Office Suite Desktop

RUSH Office Suite is the Nova Studio Plateformes desktop workspace for **PDF + Documents**.

## Main workspaces

### PDF Studio
- PDF.js viewing with thumbnails, page navigation and zoom.
- Local search with OCR fallback for scanned/image PDFs.
- Add/edit text overlays, highlight, underline, strikeout, comments, whiteout, signatures and destructive raster redaction.
- Merge, split, extract, delete, duplicate, insert, reorder, rotate and crop pages.
- PDF forms, AES-256 protection/unlock, metadata, watermark, numbering, grayscale, compression and conversion.

### Document Editor
- DOCX, ODT, RTF and TXT open/save.
- Legacy `.doc` import via an installed Word/LibreOffice converter when available.
- Rich text formatting, alignment, lists, tables, images, links, find/replace, spellcheck and PDF/HTML export.
- Templates for annual reports, school reports, invoices, CVs, business letters, invitations, meeting minutes and proposals.

## Privacy / performance
- No dedicated RUSH cloud backend is required.
- Electron renderer is sandboxed with a narrow preload bridge.
- Python document/PDF work runs outside the renderer process.
- C++17 native discovery is optional; a JS fallback remains available.
- SQLite FTS stores local search indexes. DuckDB analytics are optional.
- OCR is on-demand and uses local Tesseract when installed/bundled.

## Windows setup

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\setup-windows.ps1
npm run dev
```

Build installer:

```powershell
.\BUILD_WINDOWS.ps1
.\BUILD_WINDOWS.ps1 -Msi
```

## Linux

```bash
chmod +x BUILD_LINUX.sh scripts/*.sh
./BUILD_LINUX.sh
```

## macOS

```bash
chmod +x BUILD_MACOS.sh scripts/*.sh
./BUILD_MACOS.sh
```

## About

Created by **Nova Studio Plateformes**.

Founder: **Ephraim Lifanjo**.

Adobe Acrobat and Microsoft Word are workflow comparisons only; RUSH is not affiliated with Adobe or Microsoft.
