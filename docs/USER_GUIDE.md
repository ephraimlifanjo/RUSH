# RUSH Office Suite — User Guide

RUSH Office Suite is a privacy-first desktop workspace focused on two jobs: professional PDF work and professional text documents.

## Install

### Windows
Use the normal `RUSH-Office-Suite-<version>-x64.exe` installer. Organizations can use the MSI build for managed installation.

The packaged app contains its local document engine, so end users do **not** install Node.js, npm, Python or CMake.

### macOS / Linux
Published builds use DMG/ZIP on macOS and AppImage/DEB on Linux. Store listings must be treated as unavailable until an official listing exists.

## Sidebar and shortcuts

- Click the hamburger button to collapse/expand the sidebar.
- `Ctrl+B` toggles the sidebar.
- `Ctrl+O` opens a document.
- `Ctrl+S` saves the current editable document.

## PDF Studio

Open a PDF to use page thumbnails, zoom/navigation, selectable-text search, OCR search for scanned pages when Tesseract is available, annotations, text additions, forms, page organization, encryption/decryption, compression, metadata tools, conversion and local export.

PDF redaction is designed to remove the selected visual region from the output rather than merely drawing a cosmetic black box over it. Always verify a redacted output before distribution.

## Document Editor

RUSH opens/edits modern DOCX, ODT, RTF, TXT and HTML documents. Legacy DOC is imported through a compatible local converter when one exists; save the result as DOCX.

The editor includes undo/redo, font family/size, bold/italic/underline, alignment, lists, tables, images, links, emoji, spell checking from the platform/Electron runtime, find/replace and PDF export.

## Fonts

RUSH uses fonts already installed on the device. The editor exposes common office fonts including Segoe UI, Calibri, Arial, Times New Roman, Georgia, Cambria, Garamond, Palatino, Baskerville, Courier New, Consolas and others when installed. A user can temporarily import a local `.ttf`, `.otf`, `.woff` or `.woff2` font for the current session.

RUSH does not redistribute proprietary commercial fonts without a license.

## Themes

Included interface themes:

- RUSH — white/dark sidebar/Yelp-style red accent
- Leonore — rose/blush palette
- Melody — soft creative blue palette
- Ephraim Royale — black/gold executive theme
- Minimal Notes — neutral Notion-inspired focus workspace
- Midnight — low-glare dark workspace

Themes change the application UI. They do not silently recolor document content.

## Languages

The localization framework includes English, Spanish, German, Japanese, French, Portuguese, Russian, Italian, Chinese and Arabic. Arabic switches the application direction to RTL. Documents remain Unicode and can contain any script supported by the selected device fonts.

OCR languages depend on the Tesseract language data installed on the device. Interface language and OCR language are separate settings.

## Free and Pro

Free is intended to remain useful for standard PDF viewing/basic work, document creation/editing, common page organization, basic conversion/compression and local library use.

Pro is intended for advanced OCR/search, redaction, certificate-based digital signing, premium themes/templates, version history, advanced/batch workflows and optional local translation.

The planned direct Pro price shown on the marketing site is **US$14.99 one-time**. Store/regional prices can differ.

## Digital signatures

RUSH's advanced engine can sign a PDF using a PKCS#12 certificate (`.p12`/`.pfx`). The technical signature can be standards-based, but whether it qualifies as a legally recognized electronic signature depends on the certificate issuer, identity assurance, jurisdiction and transaction context.

## Secure sharing without a cloud backend

A no-backend desktop application cannot create a remotely revocable expiring web URL by itself. RUSH instead provides an encrypted local secure-package design using AES-256-GCM, a password-derived key and optional expiry metadata. To create real online expiring links, a separate trusted storage/link service is required.

## Version history

Local snapshots are stored under the application's user-data directory and can be restored later. This is not a replacement for institutional backups.

## Import from the internet

The optional HTTPS importer accepts public HTTPS URLs only, blocks private/local network targets, restricts supported document/image content types and limits downloads to reduce risk. Imported files are saved locally to Downloads.
