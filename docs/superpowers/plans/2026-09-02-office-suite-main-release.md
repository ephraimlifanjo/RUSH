# RUSH Office Suite Main Release Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `main` the canonical RUSH Office Suite branch, remove legacy file-organizer code, harden Windows packaging, and produce verified NSIS/portable Windows artifacts.

**Architecture:** Keep the existing Electron sandboxed renderer + React UI + isolated Python document engine + optional C++ helper. Windows packaging will build the renderer, Python engine, native helper and integrity manifest before electron-builder creates the installer.

**Tech Stack:** Electron 39, React 19, esbuild, Python 3.12, PyInstaller, pypdf/PDFium/python-docx/odfpy/reportlab, CMake/C++17, electron-builder, GitHub Actions.

**Spec:** `README.md`

## Global Constraints

- Canonical product is RUSH Office Suite, not the legacy file organizer.
- PDF and DOCX/ODT/RTF/TXT workflows must stay local-first.
- Windows installer must be buildable from `main` without developer-only files.
- Renderer remains sandboxed with `contextIsolation: true` and `nodeIntegration: false`.
- Existing engine self-tests must remain green.

---

### Task 1: Packaging regression guard

**Files:**
- Modify: `desktop/scripts/validate.mjs`
- Create: `desktop/scripts/generate-icon.py`

**Interfaces:**
- Consumes: `desktop/package.json`
- Produces: `desktop/build/icon.ico`

- [ ] Add validation for a reproducible Windows icon generation path and required packaging resources.
- [ ] Verify the validation fails before icon/resource fixes.
- [ ] Add deterministic icon generation and resource bootstrap.
- [ ] Verify validation passes.

### Task 2: Windows release workflow

**Files:**
- Modify: `.github/workflows/package-desktop.yml`
- Modify: `desktop/package.json`

**Interfaces:**
- Consumes: renderer/Python/native build scripts.
- Produces: NSIS installer and portable EXE artifacts from `main`.

- [ ] Trigger Windows packaging on pushes to `main` and workflow dispatch.
- [ ] Install all build prerequisites in the workflow.
- [ ] Run structural validation and Python engine self-test before packaging.
- [ ] Build and verify Windows artifacts.

### Task 3: Legacy cleanup

**Files:**
- Delete legacy root file-organizer Python app files and specs.

**Interfaces:**
- Produces: a repository whose runnable desktop product is only `desktop/` RUSH Office Suite.

- [ ] Remove legacy `main.py`, `core/`, `database/`, `services/`, `ui/`, `utils/`, legacy PyInstaller specs and empty root requirements.
- [ ] Keep shared/Office Suite assets and documentation.
- [ ] Run CI after cleanup.

### Task 4: Release verification

**Files:**
- No source changes unless CI exposes a reproducible defect.

**Interfaces:**
- Produces: downloadable Windows artifact.

- [ ] Confirm CI validation passes on Windows.
- [ ] Confirm installer build succeeds.
- [ ] Download artifact and verify executable PE headers and filenames.
- [ ] Deliver installer to the user.
