param(
  [switch]$WithTranslation
)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root
Write-Host "RUSH Office Suite - Windows developer setup" -ForegroundColor Cyan
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "Node.js 20+ is required for development." }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw "npm was not found." }
if (-not (Test-Path "node_modules")) { npm install } else { Write-Host "node_modules already present - skipping npm install." -ForegroundColor DarkGray }
$py = Get-Command python -ErrorAction SilentlyContinue
if (-not $py) { $py = Get-Command py -ErrorAction SilentlyContinue }
if (-not $py) { throw "Python 3.10+ is required for development/build. End users do not need Python after packaging." }
if (-not (Test-Path ".venv")) { if ($py.Name -match '^py') { py -3 -m venv .venv } else { python -m venv .venv } }
$venvPython = Join-Path $root ".venv\Scripts\python.exe"
& $venvPython -m pip install --upgrade pip
& $venvPython -m pip install -r ".\python\requirements.txt"
if ($WithTranslation) {
  Write-Host "Installing optional on-device translation runtime..." -ForegroundColor Yellow
  & $venvPython -m pip install -r ".\python\requirements-translation.txt"
  Write-Host "Translation runtime installed. Language model packs are downloaded separately only when needed." -ForegroundColor Green
}
Write-Host "Checking optional OCR runtime..." -ForegroundColor Yellow
$tess = Get-Command tesseract -ErrorAction SilentlyContinue
if (-not $tess -and (Test-Path "C:\Program Files\Tesseract-OCR\tesseract.exe")) { $tess = "C:\Program Files\Tesseract-OCR\tesseract.exe" }
if ($tess) { Write-Host "Tesseract OCR detected." -ForegroundColor Green } else { Write-Host "Tesseract OCR not detected. Normal PDF search works; scanned-PDF OCR needs Tesseract." -ForegroundColor Yellow }
npm run check
& powershell -ExecutionPolicy Bypass -File ".\scripts\build-native.ps1"
& $venvPython ".\python\self_test.py"
npm run build:ui
Write-Host "Setup complete. Launch with: npm run dev" -ForegroundColor Green
